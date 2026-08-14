'use client'

import { cn } from '@/shared/lib'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { DATA_TABLE_GUTTER } from '../../config/table.constants'

import { ActiveChips } from './active-chips'
import { QuickFilter } from './quick-filter'

import type { QuickFilterDef } from '../model/types'

interface QuickFiltersProps {
  readonly filters: ReadonlyArray<QuickFilterDef>
  readonly onToggle: (filterId: string, value: string) => void
  readonly onClear: (filterId?: string) => void
}

export function DataTableQuickFilters({ filters, onToggle, onClear }: Readonly<QuickFiltersProps>) {
  return (
    <TooltipProvider delayDuration={400}>
      <div
        data-slot="table-quick-filters"
        className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 py-2', DATA_TABLE_GUTTER)}
      >
        <ActiveChips filters={filters} onRemove={onToggle} onClearAll={() => onClear()} />

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
    </TooltipProvider>
  )
}
