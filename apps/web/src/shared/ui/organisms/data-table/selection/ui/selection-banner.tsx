'use client'

import { Text } from '@/shared/ui/atoms/text'
import { Button } from '@/shared/ui/shadcn/button'

import { useDataTableContext } from '../../model/context'

export interface SelectionBannerLabels {
  readonly pageSelected: (count: number) => string
  readonly allSelected: (total: number) => string
  readonly selectAll: (total: number) => string
  readonly clear: string
}

export interface SelectionBannerProps {
  readonly allSelected: boolean
  readonly labels: SelectionBannerLabels
  readonly onSelectAll: () => void
  readonly onClear: () => void
}

export function DataTableSelectionBanner({
  allSelected,
  labels,
  onSelectAll,
  onClear,
}: Readonly<SelectionBannerProps>) {
  const { table, selection } = useDataTableContext()
  const pageSelected = selection.active && table.getIsAllPageRowsSelected()
  if (!allSelected && (!pageSelected || selection.count >= selection.total)) return null

  return (
    <div
      data-slot="selection-banner"
      className="flex shrink-0 items-center justify-center gap-1 border-b border-border bg-primary-pale px-3 py-1.5"
    >
      <Text variant="body">
        {allSelected ? labels.allSelected(selection.total) : labels.pageSelected(selection.count)}
      </Text>
      <Button
        variant="link"
        size="sm"
        onClick={allSelected ? onClear : onSelectAll}
        className="h-auto px-1 py-0 text-sm font-medium text-primary-deep dark:text-primary"
      >
        {allSelected ? labels.clear : labels.selectAll(selection.total)}
      </Button>
    </div>
  )
}
