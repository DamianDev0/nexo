import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../query-wrapper'

import { ContactTextFieldCell } from '@/entities/contact/ui/cells/ContactTextFieldCell'

const LABELS = { edit: (field: string) => `Editar ${field}`, save: 'Guardar', cancel: 'Cancelar' }

function renderCell(onSave?: (raw: string) => void, raw = 'Norte') {
  render(
    <ContactTextFieldCell
      field="Zona"
      value={{ raw, display: raw || null, numeric: false }}
      labels={LABELS}
      onSave={onSave}
    />,
    { wrapper },
  )
}

describe('ContactTextFieldCell', () => {
  it('renders plain text without a trigger when read-only', () => {
    renderCell()
    expect(screen.getByText('Norte')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('saves the trimmed draft on Enter', async () => {
    const onSave = vi.fn()
    renderCell(onSave)
    await userEvent.click(screen.getByRole('button', { name: 'Editar Zona' }))
    const input = screen.getByRole('textbox', { name: 'Zona' })
    await userEvent.clear(input)
    await userEvent.type(input, '  Sur  {Enter}')
    expect(onSave).toHaveBeenCalledWith('Sur')
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument())
  })

  it('discards the draft on Escape and on cancel', async () => {
    const onSave = vi.fn()
    renderCell(onSave)
    await userEvent.click(screen.getByRole('button', { name: 'Editar Zona' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Zona' }), 'x{Escape}')
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: 'Editar Zona' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onSave).not.toHaveBeenCalled()
  })

  it('does not save when the value did not change', async () => {
    const onSave = vi.fn()
    renderCell(onSave)
    await userEvent.click(screen.getByRole('button', { name: 'Editar Zona' }))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(onSave).not.toHaveBeenCalled()
  })
})
