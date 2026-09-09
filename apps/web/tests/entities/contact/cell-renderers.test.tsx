import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ContactColumnContext } from '@/entities/contact/model/types/contact-cells.types'
import type { ContactListItem } from '@repo/shared-types'

import {
  contactCellRenderer,
  withContactCellLabels,
} from '@/entities/contact/ui/columns/cell-renderers'

const LEAD = { key: 'lead', label: 'Lead', color: '#60A5FA' }
const CUSTOMER = { key: 'customer', label: 'Cliente', color: '#22C55E' }
const MANUAL = { key: 'manual', label: 'Manual', color: '#64748B' }

const CONTEXT: ContactColumnContext = {
  t: ((key: string) => key) as never,
  locale: 'es-CO',
  taxonomy: {
    statusByKey: new Map([['new', { key: 'new', label: 'Nuevo', color: '#3B82F6' }]]),
    sourceByKey: new Map([['manual', MANUAL]]),
    lifecycleByKey: new Map([['lead', LEAD]]),
  },
}

function renderCell(
  key: string,
  overrides: Partial<ContactListItem> = {},
  context: Partial<ContactColumnContext> = {},
) {
  const contact = { ...CONTACTS_FIXTURE[0]!, ...overrides }
  render(
    <>{contactCellRenderer(key)(contact, withContactCellLabels({ ...CONTEXT, ...context }))}</>,
    { wrapper },
  )
  return contact
}

Element.prototype.scrollIntoView = vi.fn()

describe('contactCellRenderer', () => {
  it('resolves the status label through the tenant taxonomy', () => {
    renderCell('status', { status: 'new' })

    expect(screen.getByText('Nuevo')).toBeInTheDocument()
  })

  it('falls back to the raw key when the taxonomy has no entry', () => {
    renderCell('source', { source: 'unmapped' })

    expect(screen.getByText('unmapped')).toBeInTheDocument()
  })

  it('renders the created date with its Bogota time', () => {
    renderCell('createdAt', { createdAt: '2026-08-14T15:00:00.000Z' })

    expect(screen.getByText('14/08/2026')).toBeInTheDocument()
    expect(screen.getByText(/10:00/)).toBeInTheDocument()
  })

  it('renders an empty marker for a missing value instead of blowing up', () => {
    renderCell('lastContactedAt', { lastContactedAt: null })

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('reads unmapped columns straight off the contact', () => {
    renderCell('municipioCode', { municipioCode: '05001' })

    expect(screen.getByText('05001')).toBeInTheDocument()
  })

  it('flags channels the contact revoked through consents', () => {
    renderCell('email', { email: 'ana@empresa.co', optedOutChannels: ['email'] })

    expect(screen.getByLabelText('contacts.optOut.email')).toBeInTheDocument()
  })
})

describe('refined cells', () => {
  it('tells how long the contact has sat in its current status', () => {
    const since = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    renderCell('status', { status: 'new', statusChangedAt: since })

    expect(screen.getByText('Nuevo')).toBeInTheDocument()
    expect(screen.getByText('hace 3 días')).toBeInTheDocument()
  })

  it('reads the last activity as elapsed time, not a bare date', () => {
    const when = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    renderCell('lastContactedAt', { lastContactedAt: when })

    expect(screen.getByText('hace 2 horas')).toBeInTheDocument()
  })

  it('changes the lifecycle stage inline through the fields patch', async () => {
    const onFieldsChange = vi.fn()
    const contact = renderCell(
      'lifecycleStage',
      { lifecycleStage: 'lead' },
      { lifecycleStages: [LEAD, CUSTOMER], actions: { onFieldsChange } },
    )
    await userEvent.click(screen.getByRole('button', { name: /contacts.cells.pick/ }))
    await userEvent.click(screen.getByRole('menuitem', { name: /Cliente/ }))
    expect(onFieldsChange).toHaveBeenCalledWith(contact.id, { lifecycleStage: 'customer' })
  })

  it('clears the source with an explicit null the API accepts', async () => {
    const onFieldsChange = vi.fn()
    const contact = renderCell(
      'source',
      { source: 'manual' },
      { sources: [MANUAL], actions: { onFieldsChange } },
    )
    await userEvent.click(screen.getByRole('button', { name: /contacts.cells.pick/ }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'contacts.cells.clear' }))
    expect(onFieldsChange).toHaveBeenCalledWith(contact.id, { source: null })
  })

  it('assigns an owner inline with the resolved name', async () => {
    const onAssign = vi.fn()
    const contact = renderCell(
      'assignedTo',
      { assignedToId: null, assignedToName: null },
      { owners: [{ id: 'u1', name: 'Ana Ruiz' }], actions: { onAssign } },
    )
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByText('Ana Ruiz'))
    expect(onAssign).toHaveBeenCalledWith({
      id: contact.id,
      assignedToId: 'u1',
      assignedToName: 'Ana Ruiz',
    })
  })

  it('exposes a city combobox only when fields can change', () => {
    renderCell('city', { city: 'Cali' })
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    renderCell('city', { city: 'Cali' }, { actions: { onFieldsChange: vi.fn() } })
    expect(screen.getByRole('combobox')).toHaveTextContent('Cali')
  })

  it('offers an add-tag affordance that opens the tag editor for the row', async () => {
    const onEditTags = vi.fn()
    const contact = renderCell('tags', { tags: ['vip'] }, { actions: { onEditTags } })
    await userEvent.click(screen.getByRole('button', { name: 'contacts.cells.addTag' }))
    expect(onEditTags).toHaveBeenCalledWith(contact)
  })
})
