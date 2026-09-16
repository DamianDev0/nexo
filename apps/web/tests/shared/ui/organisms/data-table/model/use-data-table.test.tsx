import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { ColumnDef } from '@tanstack/react-table'

import { useDataTable } from '@/shared/ui/organisms/data-table'

type Row = { id: string; name: string }

const COLUMNS: ColumnDef<Row, unknown>[] = [{ id: 'name', accessorKey: 'name', header: 'Name' }]
const rows = (count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({ id: `r${i + 1}`, name: `Row ${i + 1}` }))

describe('useDataTable pagination', () => {
  it('renders every row the server sent instead of slicing to a client page size', () => {
    const { result, rerender } = renderHook(
      ({ data }) => useDataTable({ data, columns: COLUMNS, getRowId: (row) => row.id }),
      { initialProps: { data: rows(25) } },
    )
    expect(result.current.table.getRowModel().rows).toHaveLength(25)

    rerender({ data: rows(50) })
    expect(result.current.table.getRowModel().rows).toHaveLength(50)
  })

  it('reports the server total rather than the current page length', () => {
    const { result } = renderHook(() =>
      useDataTable({
        data: rows(25),
        columns: COLUMNS,
        getRowId: (row) => row.id,
        totalRows: 50225,
      }),
    )
    expect(result.current.selection.total).toBe(50225)
  })
})
