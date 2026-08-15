'use client'

import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
  type Table,
} from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'

import { DEFAULT_PAGE_SIZE } from '@/shared/config/pagination'

import {
  DATA_TABLE_MAX_COLUMN_WIDTH,
  DATA_TABLE_MIN_COLUMN_WIDTH,
  DATA_TABLE_ROW_HEIGHT,
} from '../config/table.constants'
import { resolveUpdater } from '../lib/updater'

import { useTableLayout } from './use-table-layout'

import type { DataTableDensity, DataTableLayoutBinding, DataTableSortBinding } from './types'

import './table-meta'

interface UseDataTableOptions<TData> {
  readonly data: ReadonlyArray<TData>
  readonly columns: ReadonlyArray<ColumnDef<TData, unknown>>
  readonly pageSize?: number
  readonly getRowId?: (row: TData) => string
  readonly layout?: DataTableLayoutBinding
  readonly sort?: DataTableSortBinding
  readonly totalRows?: number
}

export interface TableSelection {
  readonly count: number
  readonly total: number
  readonly active: boolean
  readonly clear: () => void
}

export interface DataTableInstance<TData> {
  readonly table: Table<TData>
  readonly reorderColumn: (activeId: string, overId: string) => void
  readonly density: DataTableDensity
  readonly setDensity: (density: DataTableDensity) => void
  readonly rowHeight: number
  readonly selection: TableSelection
}

export function useDataTable<TData>({
  data,
  columns,
  pageSize = DEFAULT_PAGE_SIZE,
  getRowId,
  layout,
  sort,
  totalRows,
}: UseDataTableOptions<TData>): DataTableInstance<TData> {
  const columnIds = useMemo(() => columns.map((column) => column.id ?? ''), [columns])
  const { state, reorder, setDensity, ...handlers } = useTableLayout(columnIds, layout)

  const sorting = useMemo<SortingState>(
    () => (sort?.value ? [{ id: sort.value.field, desc: sort.value.direction === 'desc' }] : []),
    [sort?.value],
  )

  const onSortChange = sort?.onChange
  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      const [next] = resolveUpdater(updater, sorting)
      onSortChange?.(next ? { field: next.id, direction: next.desc ? 'desc' : 'asc' } : null)
    },
    [onSortChange, sorting],
  )

  const table = useReactTable({
    data: data as TData[],
    columns: columns as ColumnDef<TData, unknown>[],
    state: {
      columnOrder: state.order,
      columnSizing: state.sizing,
      columnPinning: state.pinning,
      columnVisibility: state.visibility,
      sorting,
    },
    ...handlers,
    onSortingChange,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    defaultColumn: { minSize: DATA_TABLE_MIN_COLUMN_WIDTH, maxSize: DATA_TABLE_MAX_COLUMN_WIDTH },
    initialState: { pagination: { pageSize } },
    autoResetPageIndex: false,
    manualSorting: true,
    enableRowSelection: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
  })

  const selectedCount = table.getSelectedRowModel().rows.length
  const total = totalRows ?? data.length

  return useMemo(
    () => ({
      table,
      reorderColumn: reorder,
      density: state.density,
      setDensity,
      rowHeight: DATA_TABLE_ROW_HEIGHT[state.density],
      selection: {
        count: selectedCount,
        total,
        active: selectedCount > 0,
        clear: () => table.resetRowSelection(),
      },
    }),
    [table, reorder, state.density, setDensity, selectedCount, total],
  )
}
