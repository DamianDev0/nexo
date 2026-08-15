import type { ReactNode } from 'react'

export interface DataTableBulkLabels {
  readonly selected: (count: number) => string
  readonly selectAll: (total: number) => string
  readonly clear: string
}

export interface DataTableBulkConfig {
  readonly labels: DataTableBulkLabels
  readonly actions?: ReactNode
  readonly onSelectAll?: () => void
}
