import { PaginationCapsule } from '../pagination-capsule'

import { DataTableBody, DataTableCellText } from './body'
import { DataTableGrid, DataTableRoot, DataTableScroller, DataTableSkeleton } from './grid'
import { DataTableHeader } from './header'
import { DataTableQuickFilters } from './quick-filters'
import { DataTableSmartLists } from './smart-list'
import { DataTableDensity, DataTableSearch, DataTableToolbar } from './toolbar'

export {
  useDataTable,
  type DataTableDensity as DataTableDensityValue,
  type DataTableInstance,
} from './model/use-data-table'

export type { DataTableBulkConfig, DataTableBulkLabels } from './toolbar'
export type { SmartListItem } from './smart-list'
export type { QuickFilterDef, QuickFilterOption } from './quick-filters'
export { selectionColumn } from './selection'

export const DataTable = Object.assign(DataTableRoot, {
  SmartLists: DataTableSmartLists,
  QuickFilters: DataTableQuickFilters,
  Toolbar: DataTableToolbar,
  Search: DataTableSearch,
  Density: DataTableDensity,
  Grid: DataTableGrid,
  Header: DataTableHeader,
  Body: DataTableBody,
  Scroller: DataTableScroller,
  Skeleton: DataTableSkeleton,
  CellText: DataTableCellText,
  Pagination: PaginationCapsule,
})
