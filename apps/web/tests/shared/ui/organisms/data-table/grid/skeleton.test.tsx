import { render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, selectionColumn, useDataTable } from '@/shared/ui/organisms/data-table'

type Row = { id: string; name: string; city: string }

const COLUMNS: ReadonlyArray<ColumnDef<Row, unknown>> = [
  selectionColumn<Row>({ all: 'all', row: 'row' }),
  { id: 'name', accessorKey: 'name', size: 300, meta: { grow: true } },
  { id: 'city', accessorKey: 'city', size: 130 },
]

function renderSkeleton(layout?: { widths?: Record<string, number>; hidden?: string[] }) {
  const { result } = renderHook(() =>
    useDataTable<Row>({
      data: [],
      columns: COLUMNS,
      getRowId: (row) => row.id,
      layout: { value: layout ?? {}, onChange: () => undefined },
    }),
  )

  return render(
    <DataTable instance={result.current}>
      <DataTable.Skeleton rows={3} />
    </DataTable>,
  )
}

function widthsOf(container: HTMLElement): Array<string | undefined> {
  return [...container.querySelectorAll('col')].map((col) => col.style.width || undefined)
}

describe('DataTableSkeleton', () => {
  it('mirrors the real column widths so nothing shifts when the rows arrive', () => {
    const { container } = renderSkeleton({ widths: { name: 260 } })

    expect(widthsOf(container)).toEqual(['56px', '260px', '130px'])
  })

  it('leaves the fluid column unsized exactly like the grid does', () => {
    const { container } = renderSkeleton()

    expect(widthsOf(container)).toEqual(['56px', undefined, '130px'])
  })

  it('skips columns the user hid instead of reserving space for them', () => {
    const { container } = renderSkeleton({ hidden: ['city'] })

    expect(widthsOf(container)).toHaveLength(2)
  })

  it('renders the requested number of placeholder rows and flags itself busy', () => {
    const { container } = renderSkeleton()

    expect(container.querySelectorAll('tbody tr')).toHaveLength(3)
    expect(screen.getByRole('table').closest('[aria-busy]')).toBeInTheDocument()
  })
})
