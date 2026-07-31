'use client'

import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { ActiveChips } from './active-chips'
import { QuickFilter } from './quick-filter'

import type { QuickFilterDef } from './types'

interface QuickFiltersProps {
  readonly filters: ReadonlyArray<QuickFilterDef>
  readonly onToggle: (filterId: string, value: string) => void
  readonly onClear: (filterId?: string) => void
}

export type { QuickFilterDef, QuickFilterOption } from './types'

export function DataTableQuickFilters({ filters, onToggle, onClear }: Readonly<QuickFiltersProps>) {
  return (
    <TooltipProvider delayDuration={400}>
      <div
        data-slot="table-quick-filters"
        className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-2"
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
