import { PaginationCapsule } from '../pagination-capsule'

import { DataTableBody, DataTableRowTitle } from './ui/body'
import { DataTableBulkAction, DataTableBulkBar } from './ui/bulk-bar'
import { DataTableHeader } from './ui/header'
import { DataTableRoot } from './ui/root'
import { selectionColumn } from './ui/selection'
import { DataTableSmartLists } from './ui/smart-lists'
import {
  DataTableEditColumns,
  DataTableFilter,
  DataTableSearch,
  DataTableToolbar,
} from './ui/toolbar'

export { useDataTable, type DataTableInstance } from './model/use-data-table'
export { selectionColumn }
export type { SmartListItem } from './ui/smart-lists'

export const DataTable = Object.assign(DataTableRoot, {
  SmartLists: DataTableSmartLists,
  Toolbar: DataTableToolbar,
  Search: DataTableSearch,
  Filter: DataTableFilter,
  EditColumns: DataTableEditColumns,
  BulkBar: DataTableBulkBar,
  BulkAction: DataTableBulkAction,
  Header: DataTableHeader,
  Body: DataTableBody,
  RowTitle: DataTableRowTitle,
  Pagination: PaginationCapsule,
})
