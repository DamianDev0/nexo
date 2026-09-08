import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import { ContactOwnerCell } from '@/entities/contact/ui/cells/ContactOwnerCell'

const LABELS = { trigger: 'Responsable', search: 'Buscar', empty: 'Nada', unassign: 'Quitar' }
const OPTIONS = [
  { id: 'u1', name: 'Ana Ruiz' },
  { id: 'u2', name: 'Luis Mora' },
]

Element.prototype.scrollIntoView = vi.fn()

describe('ContactOwnerCell', () => {
  it('renders the name as text when no options or handler are available', () => {
    render(<ContactOwnerCell value="u1" name="Ana Ruiz" labels={LABELS} />, { wrapper })
    expect(screen.getByText('Ana Ruiz')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('shows a dash when unassigned and read-only', () => {
    render(<ContactOwnerCell value={null} name={null} labels={LABELS} />, { wrapper })
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('reassigns through the compact picker and resolves the new name', async () => {
    const onChange = vi.fn()
    render(
      <ContactOwnerCell
        value="u1"
        name="Ana Ruiz"
        options={OPTIONS}
        labels={LABELS}
        onChange={onChange}
      />,
      { wrapper },
    )
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByText('Luis Mora'))
    expect(onChange).toHaveBeenCalledWith('u2', 'Luis Mora')
  })

  it('unassigns with a null id and name', async () => {
    const onChange = vi.fn()
    render(
      <ContactOwnerCell
        value="u1"
        name="Ana"
        options={OPTIONS}
        labels={LABELS}
        onChange={onChange}
      />,
      { wrapper },
    )
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByText('Quitar'))
    expect(onChange).toHaveBeenCalledWith(null, null)
  })
})
