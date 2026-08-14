'use client'

import { Checkbox } from '../../../shadcn/checkbox'

import type { ColumnDef } from '@tanstack/react-table'

export interface SelectionLabels {
  readonly all: string
  readonly row: string
}

export function selectionColumn<TData>(labels: SelectionLabels): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    size: 40,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
        aria-label={labels.all}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(value === true)}
        aria-label={labels.row}
      />
    ),
  }
}
