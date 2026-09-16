import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import { ContactChoiceCell } from '@/entities/contact/ui/cells/ContactChoiceCell'

Element.prototype.scrollIntoView = vi.fn()

const OPTIONS = [
  { key: 'lead', label: 'Lead', color: '#60A5FA' },
  { key: 'customer', label: 'Cliente', color: '#22C55E' },
]

const MANY = Array.from({ length: 12 }, (_, index) => ({
  key: `source-${index}`,
  label: `Fuente ${index}`,
}))

describe('ContactChoiceCell', () => {
  it('renders the display only when the cell is read-only', () => {
    render(
      <ContactChoiceCell label="Etapa" selection={{ value: 'lead', options: OPTIONS }}>
        <span>Lead</span>
      </ContactChoiceCell>,
      { wrapper },
    )
    expect(screen.getByText('Lead')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('opens the options and reports the picked key', async () => {
    const onChange = vi.fn()
    render(
      <ContactChoiceCell label="Etapa" selection={{ value: 'lead', options: OPTIONS, onChange }}>
        <span>Lead</span>
      </ContactChoiceCell>,
      { wrapper },
    )
    await userEvent.click(screen.getByRole('combobox', { name: 'Etapa' }))
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('option', { name: /Cliente/ }))
    expect(onChange).toHaveBeenCalledWith('customer')
  })

  it('adds a search box once the list is long enough to need one', async () => {
    render(
      <ContactChoiceCell
        label="Fuente"
        selection={{ value: null, options: MANY, onChange: vi.fn() }}
      >
        <span>—</span>
      </ContactChoiceCell>,
      { wrapper },
    )
    await userEvent.click(screen.getByRole('combobox', { name: 'Fuente' }))
    await userEvent.type(screen.getByRole('textbox'), 'fuente 1')
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('offers a clear entry only when there is a value and a label for it', async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <ContactChoiceCell
        label="Fuente"
        selection={{ value: 'lead', options: OPTIONS, onChange, clearLabel: 'Sin valor' }}
      >
        <span>Lead</span>
      </ContactChoiceCell>,
      { wrapper },
    )
    await userEvent.click(screen.getByRole('combobox', { name: 'Fuente' }))
    await userEvent.click(screen.getByRole('option', { name: 'Sin valor' }))
    expect(onChange).toHaveBeenCalledWith(null)

    rerender(
      <ContactChoiceCell
        label="Fuente"
        selection={{ value: null, options: OPTIONS, onChange, clearLabel: 'Sin valor' }}
      >
        <span>—</span>
      </ContactChoiceCell>,
    )
    await userEvent.click(screen.getByRole('combobox', { name: 'Fuente' }))
    expect(screen.queryByRole('option', { name: 'Sin valor' })).not.toBeInTheDocument()
  })
})
