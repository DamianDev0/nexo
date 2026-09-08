import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'
import { queryWrapper as wrapper } from '../../query-wrapper'

import type { ContactColumnContext } from '@/entities/contact/model/types/contact-cells.types'
import type { ContactColumnDef } from '@repo/shared-types'

import { withContactCellLabels } from '@/entities/contact/ui/columns/cell-renderers'
import { customFieldCellRenderer } from '@/entities/contact/ui/columns/custom-field-cells'

const BASE: ContactColumnDef = {
  key: 'custom:zone',
  labelKey: '',
  hintKey: '',
  sortField: null,
  defaultVisible: true,
  defaultWidth: 120,
  minWidth: 80,
  custom: true,
  label: 'Zona',
}

function contextWith(onCustomFieldsChange?: ContactColumnContext['actions']) {
  return withContactCellLabels({
    t: ((key: string, opts?: { field?: string }) =>
      opts?.field ? `${key}:${opts.field}` : key) as never,
    locale: 'es-CO',
    taxonomy: { statusByKey: new Map(), sourceByKey: new Map(), lifecycleByKey: new Map() },
    actions: onCustomFieldsChange,
  })
}

describe('customFieldCellRenderer', () => {
  it('edits a text field and merges it into customFields', async () => {
    const onCustomFieldsChange = vi.fn()
    const contact = { ...CONTACTS_FIXTURE[0]!, customFields: { zone: 'Norte', other: 1 } }
    render(
      <>
        {customFieldCellRenderer({ ...BASE, fieldType: 'text' })(
          contact,
          contextWith({ onCustomFieldsChange }),
        )}
      </>,
      { wrapper },
    )
    await userEvent.click(screen.getByRole('button', { name: 'contacts.cells.edit:Zona' }))
    const input = screen.getByRole('textbox', { name: 'Zona' })
    await userEvent.clear(input)
    await userEvent.type(input, 'Sur{Enter}')
    expect(onCustomFieldsChange).toHaveBeenCalledWith(contact.id, { zone: 'Sur', other: 1 })
  })

  it('stores numbers as numbers and empty as null', async () => {
    const onCustomFieldsChange = vi.fn()
    const contact = { ...CONTACTS_FIXTURE[0]!, customFields: { zone: 3 } }
    render(
      <>
        {customFieldCellRenderer({ ...BASE, fieldType: 'number' })(
          contact,
          contextWith({ onCustomFieldsChange }),
        )}
      </>,
      { wrapper },
    )
    await userEvent.click(screen.getByRole('button', { name: 'contacts.cells.edit:Zona' }))
    const input = screen.getByRole('spinbutton', { name: 'Zona' })
    await userEvent.clear(input)
    await userEvent.type(input, '42{Enter}')
    expect(onCustomFieldsChange).toHaveBeenCalledWith(contact.id, { zone: 42 })
  })

  it('picks a select option from its badges and can clear it', async () => {
    const onCustomFieldsChange = vi.fn()
    const def: ContactColumnDef = {
      ...BASE,
      fieldType: 'select',
      fieldOptions: [
        { value: 'a', label: 'Alfa', color: '#111111' },
        { value: 'b', label: 'Beta' },
      ],
    }
    const contact = { ...CONTACTS_FIXTURE[0]!, customFields: { zone: 'a' } }
    render(<>{customFieldCellRenderer(def)(contact, contextWith({ onCustomFieldsChange }))}</>, {
      wrapper,
    })
    expect(screen.getByText('Alfa')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'contacts.cells.pick:Zona' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Beta' }))
    expect(onCustomFieldsChange).toHaveBeenCalledWith(contact.id, { zone: 'b' })
  })

  it('keeps multiselect and read-only contexts as plain badges/text', () => {
    const def: ContactColumnDef = {
      ...BASE,
      fieldType: 'multiselect',
      fieldOptions: [{ value: 'a', label: 'Alfa' }],
    }
    const contact = { ...CONTACTS_FIXTURE[0]!, customFields: { zone: ['a'] } }
    render(<>{customFieldCellRenderer(def)(contact, contextWith())}</>, { wrapper })
    expect(screen.getByText('Alfa')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
