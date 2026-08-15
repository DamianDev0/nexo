'use client'

import { cn } from '@/shared/lib'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'
import { Table, TableBody, TableCell, TableRow } from '@/shared/ui/shadcn/table'

import { DATA_TABLE_GUTTER, DATA_TABLE_SELECTION_ID } from '../../config/table.constants'
import { columnWidth } from '../../lib/column-size'
import { useDataTableContext } from '../../model/context'

interface DataTableSkeletonProps {
  readonly rows?: number
  readonly className?: string
}

const CELL_FILL: Readonly<Record<number, string>> = { 0: 'w-4/5', 1: 'w-3/5', 2: 'w-2/3' }

export function DataTableSkeleton({ rows = 6, className }: Readonly<DataTableSkeletonProps>) {
  const { table, rowHeight } = useDataTableContext()
  const { columnSizing } = table.getState()
  const columns = table.getHeaderGroups()[0]?.headers ?? []

  if (columns.length === 0) {
    return (
      <div
        data-slot="table-skeleton"
        className={cn('flex flex-col gap-2.5 pb-6', DATA_TABLE_GUTTER, className)}
        aria-busy
      >
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={`table-skeleton-row-${index + 1}`} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div data-slot="table-skeleton" className={cn('min-w-0 overflow-hidden', className)} aria-busy>
      <Table
        style={{ minWidth: table.getTotalSize() }}
        className="table-fixed border-separate border-spacing-0"
      >
        <colgroup>
          {columns.map(({ column }) => (
            <col key={column.id} style={{ width: columnWidth(column, columnSizing) }} />
          ))}
        </colgroup>
        <TableBody>
          {Array.from({ length: rows }, (_, row) => (
            <TableRow
              key={`table-skeleton-row-${row + 1}`}
              style={{ height: rowHeight }}
              className="border-row-divider bg-card [&>*:first-child]:pl-4 [&>*:last-child]:pr-4"
            >
              {columns.map(({ column }, index) => (
                <TableCell
                  key={column.id}
                  className="overflow-hidden border-b border-row-divider px-2"
                >
                  <Skeleton
                    className={cn(
                      'h-4 rounded-md',
                      column.id === DATA_TABLE_SELECTION_ID
                        ? 'size-4 rounded-sm'
                        : (CELL_FILL[(row + index) % 3] ?? 'w-3/5'),
                    )}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
