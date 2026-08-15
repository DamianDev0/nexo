import { type DATA_TABLE_ROW_HEIGHT } from '../config/table.constants'

import type { ColumnPinningState, ColumnSizingState, VisibilityState } from '@tanstack/react-table'

export type DataTableDensity = keyof typeof DATA_TABLE_ROW_HEIGHT

export type DataTableLayout = {
  readonly order?: readonly string[]
  readonly hidden?: readonly string[]
  readonly widths?: Readonly<Record<string, number>>
  readonly pinnedLeft?: readonly string[]
  readonly density?: DataTableDensity
}

export type DataTableLayoutState = {
  readonly order: string[]
  readonly sizing: ColumnSizingState
  readonly pinning: ColumnPinningState
  readonly visibility: VisibilityState
  readonly density: DataTableDensity
}

export type DataTableSort = {
  readonly field: string
  readonly direction: 'asc' | 'desc'
}

export type DataTableLayoutBinding = {
  readonly value: DataTableLayout
  readonly onChange: (next: DataTableLayout) => void
}

export type DataTableSortBinding = {
  readonly value: DataTableSort | null
  readonly onChange: (next: DataTableSort | null) => void
}
