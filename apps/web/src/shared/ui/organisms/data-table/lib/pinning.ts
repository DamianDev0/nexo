import type { Column } from '@tanstack/react-table'
import type { CSSProperties } from 'react'

export function pinStyles<TData, TValue>(column: Column<TData, TValue>): CSSProperties {
  return column.getIsPinned() === 'left' ? { left: column.getStart('left') } : {}
}

export function pinClasses<TData, TValue>(column: Column<TData, TValue>): string | undefined {
  if (column.getIsPinned() !== 'left') return undefined

  return column.getIsLastColumn('left')
    ? 'sticky group-data-[scrolled]/scroller:shadow-pin'
    : 'sticky'
}
