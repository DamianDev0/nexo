import type * as React from 'react'

export interface DataTableColumn<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
  sortable?: boolean
  filterable?: boolean
}

export interface DataTableAction {
  label: string
  value: string
}

export interface DataTablePagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
}

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export interface ColumnFilter {
  key: string
  value: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  onRowAction?: (action: string, item: T) => void
  onRowClick?: (item: T) => void
  /** Actions can be a static array or a function that returns actions based on the item */
  actions?: DataTableAction[] | ((item: T) => DataTableAction[])
  pagination?: DataTablePagination
  emptyMessage?: string
  isLoading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  onSort?: (sort: SortConfig | null) => void
  onColumnFilter?: (filters: ColumnFilter[]) => void
  expandable?: boolean
  renderExpandedRow?: (item: T) => React.ReactNode
}
