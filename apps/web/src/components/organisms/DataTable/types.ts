import type * as React from 'react'

export type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  Table,
  Row,
  Header,
  Column,
} from '@tanstack/react-table'

// ─── Pagination ─────────────────────────────────────────────────────
export interface DataTablePaginationState {
  readonly currentPage: number
  readonly totalPages: number
  readonly totalItems: number
  readonly itemsPerPage: number
  readonly onPageChange: (page: number) => void
  readonly onItemsPerPageChange?: (size: number) => void
}

// ─── Row Action ─────────────────────────────────────────────────────
export interface DataTableAction<T> {
  readonly label: string
  readonly value: string
  readonly icon?: React.ReactNode
  readonly variant?: 'default' | 'destructive'
  readonly hidden?: (row: T) => boolean
  readonly disabled?: (row: T) => boolean
}

// ─── Bulk Action ────────────────────────────────────────────────────
export interface DataTableBulkAction {
  readonly label: string
  readonly value: string
  readonly icon?: React.ReactNode
  readonly variant?: 'default' | 'destructive'
}

// ─── Empty State ────────────────────────────────────────────────────
export interface DataTableEmptyStateProps {
  readonly icon?: React.ReactNode
  readonly title: string
  readonly description?: string
  readonly action?: React.ReactNode
}

// ─── Main DataTable Props ───────────────────────────────────────────
export interface DataTableProps<TData> {
  readonly columns: import('@tanstack/react-table').ColumnDef<TData, unknown>[]
  readonly data: TData[]

  // Controlled states
  readonly sorting?: import('@tanstack/react-table').SortingState
  readonly onSortingChange?: (sorting: import('@tanstack/react-table').SortingState) => void
  readonly columnFilters?: import('@tanstack/react-table').ColumnFiltersState
  readonly onColumnFiltersChange?: (
    filters: import('@tanstack/react-table').ColumnFiltersState,
  ) => void
  readonly columnVisibility?: import('@tanstack/react-table').VisibilityState
  readonly onColumnVisibilityChange?: (
    visibility: import('@tanstack/react-table').VisibilityState,
  ) => void
  readonly rowSelection?: import('@tanstack/react-table').RowSelectionState
  readonly onRowSelectionChange?: (
    selection: import('@tanstack/react-table').RowSelectionState,
  ) => void

  // Features
  readonly pagination?: DataTablePaginationState
  readonly actions?: DataTableAction<TData>[] | ((row: TData) => DataTableAction<TData>[])
  readonly bulkActions?: DataTableBulkAction[]
  readonly onBulkAction?: (action: string, rows: TData[]) => void
  readonly onRowClick?: (row: TData) => void
  readonly getRowId?: (row: TData) => string

  // Search
  readonly searchable?: boolean
  readonly searchValue?: string
  readonly onSearchChange?: (value: string) => void
  readonly searchPlaceholder?: string

  // UI
  readonly isLoading?: boolean
  readonly emptyState?: DataTableEmptyStateProps
  readonly className?: string
  readonly stickyHeader?: boolean

  // Expandable
  readonly expandable?: boolean
  readonly renderExpandedRow?: (row: TData) => React.ReactNode

  // Toolbar extras (filters, column visibility toggle, etc.)
  readonly toolbarContent?: React.ReactNode
}
