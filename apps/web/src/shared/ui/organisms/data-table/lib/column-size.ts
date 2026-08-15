import type { Column } from '@tanstack/react-table'

export function clampColumnWidth(width: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(width), min), max)
}

export function columnWidth<TData, TValue>(column: Column<TData, TValue>): number | undefined {
  if (column.columnDef.meta?.grow !== true) return column.getSize()

  const anchorsAnotherPin = column.getIsPinned() === 'left' && !column.getIsLastColumn('left')
  return anchorsAnotherPin ? column.getSize() : undefined
}
