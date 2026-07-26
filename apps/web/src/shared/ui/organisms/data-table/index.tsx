import { cn } from '@/shared/lib'

import { PaginationCapsule } from '../pagination-capsule'

import { TableCell, TableHeader, TableRow, TableRowTitle } from './rows'
import { TableBulkAction, TableBulkBar, TableSearchPill, TableToolbar } from './toolbar'

import type { ReactNode } from 'react'

function TableRoot({ children, className }: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div data-slot="table-root" className={cn('overflow-hidden rounded-xl bg-card', className)}>
      {children}
    </div>
  )
}

export const DataTable = Object.assign(TableRoot, {
  Toolbar: TableToolbar,
  Search: TableSearchPill,
  BulkBar: TableBulkBar,
  BulkAction: TableBulkAction,
  Header: TableHeader,
  Row: TableRow,
  Cell: TableCell,
  RowTitle: TableRowTitle,
  Pagination: PaginationCapsule,
})
