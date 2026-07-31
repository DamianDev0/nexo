'use client'

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnOrderState,
  type OnChangeFn,
  type Table,
} from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { DEFAULT_PAGE_SIZE } from '@/shared/config/pagination'

const STORAGE_PREFIX = 'nexo.table.columnOrder.v1:'

interface UseDataTableOptions<TData> {
  readonly data: ReadonlyArray<TData>
  readonly columns: ReadonlyArray<ColumnDef<TData, unknown>>
  readonly pageSize?: number
  readonly getRowId?: (row: TData) => string
  readonly storageKey?: string
}

export interface DataTableInstance<TData> {
  readonly table: Table<TData>
  readonly reorderColumn: (activeId: string, overId: string) => void
}

function reconcile(stored: ReadonlyArray<string>, current: ReadonlyArray<string>): string[] {
  const valid = new Set(current)
  const kept = stored.filter((id) => valid.has(id))
  const known = new Set(kept)
  return [...kept, ...current.filter((id) => !known.has(id))]
}

function readOrder(key: string): string[] | null {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : null
  } catch {
    return null
  }
}

function writeOrder(key: string, order: ReadonlyArray<string>): void {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(order))
  } catch {
    return
  }
}

export function useDataTable<TData>({
  data,
  columns,
  pageSize = DEFAULT_PAGE_SIZE,
  getRowId,
  storageKey,
}: UseDataTableOptions<TData>): DataTableInstance<TData> {
  const columnIds = useMemo(() => columns.map((column) => column.id ?? ''), [columns])
  const [columnOrder, setColumnOrder] = useState<string[]>(columnIds)

  useEffect(() => {
    if (!storageKey) return
    const stored = readOrder(storageKey)
    setColumnOrder(stored ? reconcile(stored, columnIds) : columnIds)
  }, [storageKey, columnIds])

  const handleOrderChange: OnChangeFn<ColumnOrderState> = useCallback(
    (updater) =>
      setColumnOrder((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (storageKey) writeOrder(storageKey, next)
        return next
      }),
    [storageKey],
  )

  const table = useReactTable({
    data: data as TData[],
    columns: columns as ColumnDef<TData, unknown>[],
    state: { columnOrder },
    onColumnOrderChange: handleOrderChange,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    enableRowSelection: true,
  })

  const reorderColumn = useCallback(
    (activeId: string, overId: string) => {
      setColumnOrder((order) => {
        const from = order.indexOf(activeId)
        const to = order.indexOf(overId)
        if (from < 0 || to < 0 || from === to) return order
        const next = [...order]
        const moved = next.splice(from, 1)[0]
        if (!moved) return order
        next.splice(to, 0, moved)
        if (storageKey) writeOrder(storageKey, next)
        return next
      })
    },
    [storageKey],
  )

  return { table, reorderColumn }
}
