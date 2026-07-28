'use client'

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Table,
} from '@tanstack/react-table'
import { useCallback, useState } from 'react'

interface UseDataTableOptions<TData> {
  readonly data: ReadonlyArray<TData>
  readonly columns: ReadonlyArray<ColumnDef<TData, unknown>>
  readonly pageSize?: number
  readonly getRowId?: (row: TData) => string
}

export interface DataTableInstance<TData> {
  readonly table: Table<TData>
  readonly reorderColumn: (activeId: string, overId: string) => void
}

export function useDataTable<TData>({
  data,
  columns,
  pageSize = 25,
  getRowId,
}: UseDataTableOptions<TData>): DataTableInstance<TData> {
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((column) => column.id ?? ''),
  )

  const table = useReactTable({
    data: data as TData[],
    columns: columns as ColumnDef<TData, unknown>[],
    state: { columnOrder },
    onColumnOrderChange: setColumnOrder,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    enableRowSelection: true,
  })

  const reorderColumn = useCallback((activeId: string, overId: string) => {
    setColumnOrder((order) => {
      const from = order.indexOf(activeId)
      const to = order.indexOf(overId)
      if (from < 0 || to < 0 || from === to) return order
      const next = [...order]
      const moved = next.splice(from, 1)[0]
      if (!moved) return order
      next.splice(to, 0, moved)
      return next
    })
  }, [])

  return { table, reorderColumn }
}
