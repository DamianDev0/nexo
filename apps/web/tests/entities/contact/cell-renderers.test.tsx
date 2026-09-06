import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ContactColumnContext } from '@/entities/contact/model/types/contact-cells.types'
import type { ContactListItem } from '@repo/shared-types'

import {
  contactCellRenderer,
  withContactCellLabels,
} from '@/entities/contact/ui/columns/cell-renderers'

const CONTEXT: ContactColumnContext = {
  t: ((key: string) => key) as never,
  locale: 'es-CO',
  taxonomy: {
    statusByKey: new Map([['new', { key: 'new', label: 'Nuevo', color: '#3B82F6' }]]),
    sourceByKey: new Map([['manual', { key: 'manual', label: 'Manual', color: '#64748B' }]]),
    lifecycleByKey: new Map([['lead', { key: 'lead', label: 'Lead', color: '#60A5FA' }]]),
  },
}

function renderCell(key: string, overrides: Partial<ContactListItem> = {}) {
  const contact = { ...CONTACTS_FIXTURE[0]!, ...overrides }
  render(<>{contactCellRenderer(key)(contact, withContactCellLabels(CONTEXT))}</>, { wrapper })
}

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
})
