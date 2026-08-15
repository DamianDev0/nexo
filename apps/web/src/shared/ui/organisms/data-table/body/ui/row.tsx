'use client'

import { flexRender } from '@tanstack/react-table'

import { cn } from '@/shared/lib/cn'
import { TableCell, TableRow } from '@/shared/ui/shadcn/table'

import { cellAlignment } from '../../lib/cell-align'
import { pinClasses, pinStyles } from '../../lib/pinning'

import type { Row } from '@tanstack/react-table'

export function DataTableRow<TData>({
  row,
  height,
}: Readonly<{ row: Row<TData>; height: number }>) {
  const selected = row.getIsSelected()

  return (
    <TableRow
      data-state={selected ? 'selected' : undefined}
      style={{ height }}
      className={cn(
        'group/row border-row-divider [&>*:first-child]:pl-4 [&>*:last-child]:pr-4 [&_td:has([role=checkbox])]:pr-2',
        selected ? 'bg-row-selected hover:bg-row-selected' : 'bg-card hover:bg-row-hover',
      )}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          style={pinStyles(cell.column)}
          className={cn(
            'overflow-hidden border-b border-row-divider px-2 text-sm text-ellipsis text-body',
            cellAlignment(cell.column.columnDef),
            cell.column.getIsPinned() &&
              (selected ? 'z-11 bg-row-selected' : 'z-11 bg-card group-hover/row:bg-row-hover'),
            pinClasses(cell.column),
          )}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}
