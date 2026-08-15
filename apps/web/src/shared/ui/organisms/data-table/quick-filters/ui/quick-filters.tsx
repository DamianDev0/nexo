'use client'

import { cn } from '@/shared/lib'

import { DATA_TABLE_GUTTER } from '../../config/table.constants'

import { ActiveChips } from './active-chips'
import { QuickFilter } from './quick-filter'

import type { QuickFilterDef } from '../model/types'
import type { ReactNode } from 'react'

interface QuickFiltersProps {
  readonly filters: ReadonlyArray<QuickFilterDef>
  readonly onToggle: (filterId: string, value: string) => void
  readonly onClear: (filterId?: string) => void
  readonly announcement?: ReactNode
  readonly className?: string
}

export function DataTableQuickFilters({
  filters,
  onToggle,
  onClear,
  announcement,
  className,
}: Readonly<QuickFiltersProps>) {
  return (
    <div
      data-slot="table-quick-filters"
      className={cn(
        'flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-1',
        DATA_TABLE_GUTTER,
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        {announcement}
        <ActiveChips filters={filters} onRemove={onToggle} onClearAll={() => onClear()} />
      </span>

      <div className="flex shrink-0 items-center gap-4 overflow-x-auto">
        {filters.map((filter) => (
          <QuickFilter
            key={filter.id}
            filter={filter}
            onToggle={(value) => onToggle(filter.id, value)}
            onClear={() => onClear(filter.id)}
          />
        ))}
      </div>
    </div>
  )
}
