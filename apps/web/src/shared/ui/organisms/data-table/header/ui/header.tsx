'use client'

import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'

import { cn } from '@/shared/lib/cn'
import { TableHeader, TableRow } from '@/shared/ui/shadcn/table'

import { useDataTableContext } from '../../model/context'

import { HeaderCell } from './header-cell'

export function DataTableHeader({ className }: Readonly<{ className?: string }>) {
  const { table } = useDataTableContext()

  const headerGroup = table.getHeaderGroups()[0]
  if (!headerGroup) return null

  return (
    <SortableContext
      items={headerGroup.headers.map((header) => header.column.id)}
      strategy={horizontalListSortingStrategy}
    >
      <TableHeader className={cn('sticky top-0 z-30 [&_tr]:border-b-0', className)}>
        <TableRow className="[&>*:first-child]:pl-4 [&>*:last-child]:pr-4 [&_th:has([role=checkbox])]:pr-2 hover:bg-transparent">
          {headerGroup.headers.map((header) => (
            <HeaderCell key={header.id} header={header} />
          ))}
        </TableRow>
      </TableHeader>
    </SortableContext>
  )
}
