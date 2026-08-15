'use client'

import { useCallback } from 'react'

import { DATA_TABLE_SELECTION_ID } from '../../config/table.constants'
import { useDataTableContext } from '../../model/context'

export interface ColumnEditorItem {
  readonly id: string
  readonly label: string
  readonly visible: boolean
  readonly locked: boolean
}

export function useColumnEditor() {
  const { table, reorderColumn } = useDataTableContext()
  const { columnOrder } = table.getState()

  const rank = new Map(columnOrder.map((id, index) => [id, index]))

  const items: ColumnEditorItem[] = table
    .getAllLeafColumns()
    .filter((column) => column.id !== DATA_TABLE_SELECTION_ID)
    .sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0))
    .map((column) => ({
      id: column.id,
      label: column.columnDef.meta?.label ?? column.id,
      visible: column.getIsVisible(),
      locked: !column.getCanHide(),
    }))

  const toggle = useCallback(
    (id: string, visible: boolean) => table.getColumn(id)?.toggleVisibility(visible),
    [table],
  )

  const showAll = useCallback(
    () => table.getAllLeafColumns().forEach((column) => column.toggleVisibility(true)),
    [table],
  )

  const resetWidths = useCallback(() => table.resetColumnSizing(), [table])

  return {
    items,
    visibleCount: items.filter((item) => item.visible).length,
    toggle,
    reorder: reorderColumn,
    showAll,
    resetWidths,
  }
}
