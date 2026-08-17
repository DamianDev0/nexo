import { render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, selectionColumn, useDataTable } from '@/shared/ui/organisms/data-table'

type Row = { id: string; name: string; city: string; score: number; stage: string }

const COLUMNS: ReadonlyArray<ColumnDef<Row, unknown>> = [
  selectionColumn<Row>({ all: 'all', row: 'row' }),
  { id: 'name', accessorKey: 'name', enableHiding: false, meta: { label: 'Name' } },
  { id: 'city', accessorKey: 'city', meta: { label: 'City' } },
  { id: 'score', accessorKey: 'score', meta: { label: 'Score' } },
  { id: 'stage', accessorKey: 'stage', meta: { label: 'Stage' } },
]

function setup(layout: { hidden?: string[]; order?: string[]; pinnedLeft?: string[] } = {}) {
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

    expect(labels).toHaveLength(4)
    expect(labels[0]).toContain('Name')
    expect(labels[3]).toContain('Stage')
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

  it('still lets an unhideable column be reordered — locked is about visibility', async () => {
    setup({ pinnedLeft: [] })
    await openDrawer()

    const [unhideable] = screen.getAllByRole('listitem')

    expect(unhideable?.querySelector('[aria-label*="reorder"]')).toBeInTheDocument()
  })

  it('gives a pinned column no drag handle, because the table always draws it first', async () => {
    setup({ pinnedLeft: ['name'] })
    await openDrawer()

    const [pinned, movable] = screen.getAllByRole('listitem')

    expect(pinned?.querySelector('[aria-label*="reorder"]')).toBeNull()
    expect(movable?.querySelector('[aria-label*="reorder"]')).toBeInTheDocument()
  })

  it('anchors pinned columns above the sortable ones, mirroring the table', async () => {
    setup({ pinnedLeft: ['city'] })
    await openDrawer()

    const labels = screen.getAllByRole('listitem').map((item) => item.textContent)

    expect(labels[0]).toContain('City')
  })

  it('pins the first three columns until the user says otherwise', async () => {
    setup()
    await openDrawer()

    const items = screen.getAllByRole('listitem')

    expect(items[2]?.querySelector('[aria-label*="reorder"]')).toBeNull()
    expect(items[3]?.querySelector('[aria-label*="reorder"]')).toBeInTheDocument()
  })

  it('collapses from the edge like the other drawers, with no dismissal cross', async () => {
    setup()
    await openDrawer()

    const collapse = screen.getByRole('button', { name: /collapsePanel/i })

    expect(collapse).toHaveAttribute('aria-expanded', 'true')
    expect(screen.queryByRole('button', { name: /^close$/i })).not.toBeInTheDocument()
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
