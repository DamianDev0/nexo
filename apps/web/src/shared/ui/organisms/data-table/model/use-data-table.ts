'use client'

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnSizingState,
  type Table,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { DEFAULT_PAGE_SIZE } from '@/shared/config/pagination'
import { useLocalStorageState } from '@/shared/lib/hooks/useLocalStorageState'

import {
  DATA_TABLE_MAX_COLUMN_WIDTH,
  DATA_TABLE_MIN_COLUMN_WIDTH,
  DATA_TABLE_ROW_HEIGHT,
  DATA_TABLE_STORAGE_PREFIX,
} from '../config/table.constants'

import { useColumnOrder } from './column-order'
import { useColumnPinning } from './column-pinning'

import './table-meta'

export type DataTableDensity = keyof typeof DATA_TABLE_ROW_HEIGHT

interface UseDataTableOptions<TData> {
  readonly data: ReadonlyArray<TData>
  readonly columns: ReadonlyArray<ColumnDef<TData, unknown>>
  readonly pageSize?: number
  readonly getRowId?: (row: TData) => string
  readonly storageKey?: string
  readonly pinnedColumns?: ReadonlyArray<string>
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
  storageKey,
  pinnedColumns,
  totalRows,
}: UseDataTableOptions<TData>): DataTableInstance<TData> {
  const columnIds = useMemo(() => columns.map((column) => column.id ?? ''), [columns])
  const order = useColumnOrder(columnIds, storageKey)

  const [density, setDensity] = useLocalStorageState<DataTableDensity>(
    `${DATA_TABLE_STORAGE_PREFIX}density.v1:${storageKey ?? 'default'}`,
    'comfortable',
  )
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const pinning = useColumnPinning(order.columnOrder, pinnedColumns)

  const table = useReactTable({
    data: data as TData[],
    columns: columns as ColumnDef<TData, unknown>[],
    state: {
      columnOrder: order.columnOrder,
      columnSizing,
      columnPinning: pinning.columnPinning,
    },
    onColumnOrderChange: order.onColumnOrderChange,
    onColumnSizingChange: setColumnSizing,
    onColumnPinningChange: pinning.onColumnPinningChange,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    defaultColumn: { minSize: DATA_TABLE_MIN_COLUMN_WIDTH, maxSize: DATA_TABLE_MAX_COLUMN_WIDTH },
    initialState: { pagination: { pageSize } },
    autoResetPageIndex: false,
    enableRowSelection: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
  })

  const selectedCount = table.getSelectedRowModel().rows.length
  const total = totalRows ?? data.length

  return useMemo(
    () => ({
      table,
      reorderColumn: order.reorder,
      density,
      setDensity,
      rowHeight: DATA_TABLE_ROW_HEIGHT[density],
      selection: {
        count: selectedCount,
        total,
        active: selectedCount > 0,
        clear: () => table.resetRowSelection(),
      },
    }),
    [table, order.reorder, density, setDensity, selectedCount, total],
  )
}
