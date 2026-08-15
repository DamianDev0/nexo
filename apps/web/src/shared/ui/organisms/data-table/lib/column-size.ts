import type { Column, ColumnSizingState } from '@tanstack/react-table'

export function clampColumnWidth(width: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(width), min), max)
}

export function columnWidth<TData, TValue>(
  column: Column<TData, TValue>,
  sizing: ColumnSizingState,
): number | undefined {
  const isFluid = column.columnDef.meta?.grow === true && sizing[column.id] === undefined
  if (!isFluid) return column.getSize()

  const anchorsAnotherPin = column.getIsPinned() === 'left' && !column.getIsLastColumn('left')
  return anchorsAnotherPin ? column.getSize() : undefined
}
