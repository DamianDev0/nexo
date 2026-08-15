'use client'

import { SmoothCheckbox } from '@/shared/ui/smoothui/checkbox'

import { DATA_TABLE_SELECTION_ID } from '../../config/table.constants'

import type { ColumnDef } from '@tanstack/react-table'

export interface SelectionLabels {
  readonly all: string
  readonly row: string
}

const SELECTION_BOX = 'transition-colors duration-150 shadow-none'

export function selectionColumn<TData>(labels: SelectionLabels): ColumnDef<TData, unknown> {
  return {
    id: DATA_TABLE_SELECTION_ID,
    size: 56,
    minSize: 56,
    maxSize: 56,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    header: ({ table }) => (
      <SmoothCheckbox
        className={SELECTION_BOX}
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
        aria-label={labels.all}
      />
    ),
    cell: ({ row }) => (
      <SmoothCheckbox
        className={SELECTION_BOX}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(value === true)}
        aria-label={labels.row}
      />
    ),
  }
}
