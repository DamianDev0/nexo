import type { TableSaveStatus } from '@/features/customize-table'
import type { ViewSnapshot } from '@/features/manage-views'
import type { QuickFilterDef, SmartListItem } from '@/shared/ui/organisms/data-table'
import type { FilterFieldDef } from '@/shared/ui/organisms/filter-bar'
import type { FilterCondition, ObjectView } from '@repo/shared-types'

export type RecordsBoardLists = {
  readonly items: ReadonlyArray<SmartListItem>
  readonly activeId: string
}

export type RecordsBoardState = {
  readonly search: string
  readonly total: number
  readonly page: number
  readonly totalPages: number
  readonly limit: number
  readonly isPending: boolean
  readonly isFetching: boolean
  readonly isFiltered: boolean
  readonly isArchived: boolean
  readonly isEmpty: boolean
  readonly isFailed: boolean
  readonly isUnavailable: boolean
  readonly saveStatus: TableSaveStatus
  readonly advanced: ReadonlyArray<FilterCondition>
  readonly advancedFields: ReadonlyArray<FilterFieldDef>
  readonly viewSnapshot: ViewSnapshot
  readonly activeView: ObjectView | null
  readonly quickFilters: ReadonlyArray<QuickFilterDef>
}

export type RecordsBoardActions = {
  readonly onSelectList: (id: string) => void
  readonly onReorderLists: (ids: ReadonlyArray<string>) => void
  readonly onAdvancedChange: (conditions: ReadonlyArray<FilterCondition>) => void
  readonly onSearch: (value: string) => void
  readonly onPageChange: (page: number) => void
  readonly onRetry: () => unknown
  readonly onPrefetchPage: (page: number) => void
  readonly onLimitChange: (limit: number) => void
  readonly onCreate: () => void
  readonly onToggleFilter: (filterId: string, value: string) => void
  readonly onClearFilters: () => void
  readonly onRevertFilters: () => void
}
