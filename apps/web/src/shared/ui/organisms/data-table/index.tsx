import { PaginationCapsule } from '../pagination-capsule'

import { DataTableQuickFilters } from './quick-filters'
import { DataTableSmartLists } from './smart-list'
import { DataTableBody, DataTableCellText, DataTableRowTitle } from './ui/body'
import { DataTableBulkAction, DataTableBulkBar } from './ui/bulk-bar'
import { DataTableHeader } from './ui/header'
import { DataTableRoot } from './ui/root'
import { DataTableScroller } from './ui/scroller'
import { DataTableSkeleton } from './ui/skeleton'
import {
  DataTableEditColumns,
  DataTableFilter,
  DataTableSearch,
  DataTableToolbar,
} from './ui/toolbar'

export { useDataTable, type DataTableInstance } from './model/use-data-table'

export type { SmartListItem } from './smart-list'
export type { QuickFilterDef, QuickFilterOption } from './quick-filters'
export { selectionColumn } from './ui/selection'

export const DataTable = Object.assign(DataTableRoot, {
  SmartLists: DataTableSmartLists,
  QuickFilters: DataTableQuickFilters,
  Toolbar: DataTableToolbar,
  Search: DataTableSearch,
  Filter: DataTableFilter,
  EditColumns: DataTableEditColumns,
  BulkBar: DataTableBulkBar,
  BulkAction: DataTableBulkAction,
  Header: DataTableHeader,
  Body: DataTableBody,
  Scroller: DataTableScroller,
  Skeleton: DataTableSkeleton,
  RowTitle: DataTableRowTitle,
  CellText: DataTableCellText,
  Pagination: PaginationCapsule,
})
