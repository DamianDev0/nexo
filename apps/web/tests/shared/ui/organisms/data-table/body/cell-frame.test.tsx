import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { queryWrapper as wrapper } from '../../../../../query-wrapper'

import { DataTable } from '@/shared/ui/organisms/data-table'

describe('DataTable.CellHint', () => {
  it('exposes the hint as an accessible image label', () => {
    render(<DataTable.CellHint hint="No contactar">x</DataTable.CellHint>, { wrapper })

    expect(screen.getByRole('img', { name: 'No contactar' })).toBeInTheDocument()
  })
})

describe('DataTable.CellFrame', () => {
  it('floats the action dock over the row on hover and runs the picked action', async () => {
    const onCopy = vi.fn()
    render(
      <DataTable.CellFrame
        display="+57 300 123 4567"
        actions={{
          label: 'Acciones',
          items: [{ id: 'copy', label: 'Copiar', icon: <svg aria-hidden />, onClick: onCopy }],
        }}
      />,
      { wrapper },
    )

    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
    await userEvent.hover(screen.getByText('+57 300 123 4567'))

    const dock = await screen.findByRole('toolbar', { name: 'Acciones' })
    expect(dock).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Copiar' }))
    expect(onCopy).toHaveBeenCalledOnce()
  })

  it('shows the full value inside the dock when the cell text is truncated', async () => {
    render(
      <DataTable.CellFrame
        display="emiliano.cardenas14@example.co"
        actions={{
          label: 'Acciones',
          items: [{ id: 'copy', label: 'Copiar', icon: <svg aria-hidden />, onClick: vi.fn() }],
        }}
      />,
      { wrapper },
    )
    const text = screen.getByText('emiliano.cardenas14@example.co')
    Object.defineProperty(text, 'scrollWidth', { value: 240, configurable: true })
    Object.defineProperty(text, 'clientWidth', { value: 120, configurable: true })

    await userEvent.hover(text)
    const dock = await screen.findByRole('toolbar', { name: 'Acciones' })
    expect(dock.querySelector('[data-slot="action-dock-title"]')).toHaveTextContent(
      'emiliano.cardenas14@example.co',
    )
  })

  it('omits the value from the dock when the text fits', async () => {
    render(
      <DataTable.CellFrame
        display="short"
        actions={{
          label: 'Acciones',
          items: [{ id: 'copy', label: 'Copiar', icon: <svg aria-hidden />, onClick: vi.fn() }],
        }}
      />,
      { wrapper },
    )
    await userEvent.hover(screen.getByText('short'))
    const dock = await screen.findByRole('toolbar', { name: 'Acciones' })
    expect(dock.querySelector('[data-slot="action-dock-title"]')).toBeNull()
  })

  it('keeps status hints always visible without opening the dock', () => {
    render(
      <DataTable.CellFrame
        display="value"
        hint={<span>blocked</span>}
        actions={{ label: 'Acciones', items: [] }}
      />,
      { wrapper },
    )

    expect(screen.getByText('blocked')).toBeVisible()
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
  })
})
