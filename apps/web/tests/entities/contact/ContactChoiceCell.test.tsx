import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import { ContactChoiceCell } from '@/entities/contact/ui/cells/ContactChoiceCell'

const OPTIONS = [
  { key: 'lead', label: 'Lead', color: '#60A5FA' },
  { key: 'customer', label: 'Cliente', color: '#22C55E' },
]

describe('ContactChoiceCell', () => {
  it('renders the display only when the cell is read-only', () => {
    render(
      <ContactChoiceCell label="Etapa" selection={{ value: 'lead', options: OPTIONS }}>
        <span>Lead</span>
      </ContactChoiceCell>,
      { wrapper },
    )
    expect(screen.getByText('Lead')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('opens the options and reports the picked key, disabling the current one', async () => {
    const onChange = vi.fn()
    render(
      <ContactChoiceCell label="Etapa" selection={{ value: 'lead', options: OPTIONS, onChange }}>
        <span>Lead</span>
      </ContactChoiceCell>,
      { wrapper },
    )
    await userEvent.click(screen.getByRole('button', { name: 'Etapa' }))
    expect(screen.getByRole('menuitem', { name: /Lead/ })).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(screen.getByRole('menuitem', { name: /Cliente/ }))
    expect(onChange).toHaveBeenCalledWith('customer')
  })

  it('offers a clear entry only when there is a value and a label for it', async () => {
    const onChange = vi.fn()
    render(
      <ContactChoiceCell
        label="Fuente"
        selection={{ value: 'lead', options: OPTIONS, onChange, clearLabel: 'Sin valor' }}
      >
        <span>Lead</span>
      </ContactChoiceCell>,
      { wrapper },
    )
    await userEvent.click(screen.getByRole('button', { name: 'Fuente' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sin valor' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
