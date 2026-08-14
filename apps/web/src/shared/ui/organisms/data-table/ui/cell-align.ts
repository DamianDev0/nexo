import type { ColumnDef, RowData } from '@tanstack/react-table'

const ALIGNMENT = {
  start: 'justify-start text-left',
  center: 'justify-center text-center',
  end: 'justify-end text-right',
} as const

export function cellAlignment<TData extends RowData, TValue>(
  column: ColumnDef<TData, TValue>,
): string {
  return ALIGNMENT[column.meta?.align ?? 'start']
}
