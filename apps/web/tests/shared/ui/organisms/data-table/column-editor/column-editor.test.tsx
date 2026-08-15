import { render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, selectionColumn, useDataTable } from '@/shared/ui/organisms/data-table'

type Row = { id: string; name: string; city: string; score: number }

const COLUMNS: ReadonlyArray<ColumnDef<Row, unknown>> = [
  selectionColumn<Row>({ all: 'all', row: 'row' }),
  { id: 'name', accessorKey: 'name', enableHiding: false, meta: { label: 'Name' } },
  { id: 'city', accessorKey: 'city', meta: { label: 'City' } },
  { id: 'score', accessorKey: 'score', meta: { label: 'Score' } },
]

function setup(layout: { hidden?: string[]; order?: string[] } = {}) {
  const saved: unknown[] = []
  const { result } = renderHook(() =>
    useDataTable<Row>({
      data: [],
      columns: COLUMNS,
      getRowId: (row) => row.id,
      layout: { value: layout, onChange: (next) => saved.push(next) },
    }),
  )

  const view = render(
    <DataTable instance={result.current}>
      <DataTable.Columns />
    </DataTable>,
  )

  return { ...view, saved }
}

async function openDrawer() {
  await userEvent.click(screen.getByRole('button', { name: /columns/i }))
}

describe('DataTableColumnEditor', () => {
  it('lists every column in table order and leaves the selection column out', async () => {
    setup()
    await openDrawer()

    const labels = screen.getAllByRole('listitem').map((item) => item.textContent)

    expect(labels).toHaveLength(3)
    expect(labels[0]).toContain('Name')
    expect(labels[2]).toContain('Score')
  })

  it('follows the stored order instead of the definition order', async () => {
    setup({ order: ['score', 'city', 'name'] })
    await openDrawer()

    const labels = screen.getAllByRole('listitem').map((item) => item.textContent)

    expect(labels[0]).toContain('Score')
    expect(labels[2]).toContain('Name')
  })

  it('shows a lock instead of a switch for a column that cannot be hidden', async () => {
    setup()
    await openDrawer()

    expect(screen.queryByRole('switch', { name: 'Name' })).not.toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'City' })).toBeInTheDocument()
  })

  it('reflects which columns are off and turns one back on', async () => {
    const { saved } = setup({ hidden: ['city'] })
    await openDrawer()

    const city = screen.getByRole('switch', { name: 'City' })
    expect(city).toHaveAttribute('data-state', 'unchecked')

    await userEvent.click(city)

    expect(saved.at(-1)).toMatchObject({ hidden: [] })
  })

  it('brings every hidden column back at once', async () => {
    const { saved } = setup({ hidden: ['city', 'score'] })
    await openDrawer()

    await userEvent.click(screen.getByRole('button', { name: /showAllColumns/i }))

    expect(saved.at(-1)).toMatchObject({ hidden: [] })
  })

  it('clears the stored widths when resetting them', async () => {
    const { saved } = setup()
    await openDrawer()

    await userEvent.click(screen.getByRole('button', { name: /resetWidths/i }))

    expect(saved.at(-1)).toMatchObject({ widths: {} })
  })
})
