'use client'

import { useState } from 'react'

import type { ActionMenuItem } from '@/shared/ui/molecules/action-menu'
import type { Table } from '@tanstack/react-table'
import type { MouseEvent } from 'react'

export type RowContextMenuBuilder<TData> = (row: TData) => ReadonlyArray<ActionMenuItem>

export function useRowContextMenu<TData>(
  table: Table<TData>,
  build: RowContextMenuBuilder<TData> | undefined,
) {
  const [rowId, setRowId] = useState<string | null>(null)

  const row = rowId === null ? undefined : table.getRowModel().rowsById[rowId]
  const items = row && build ? build(row.original) : []

  const onContextMenu = build
    ? (event: MouseEvent<HTMLElement>) => {
        const id = (event.target as Element).closest<HTMLElement>('[data-row-id]')?.dataset.rowId
        if (id === undefined) event.preventDefault()
        else setRowId(id)
      }
    : undefined

  return { items, onContextMenu }
}
