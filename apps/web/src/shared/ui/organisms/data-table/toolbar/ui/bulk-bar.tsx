'use client'

import { cn } from '@/shared/lib/cn'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { SwapText } from '@/shared/ui/atoms/swap-text'
import { XIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'

import { DATA_TABLE_TOOLBAR_BUTTON } from '../../config/table.constants'
import { useDataTableContext } from '../../model/context'

import type { DataTableBulkConfig } from '../model/types'

export function DataTableBulkBar({
  labels,
  actions,
  onSelectAll,
  onUnselectAll,
}: Readonly<DataTableBulkConfig>) {
  const { selection } = useDataTableContext()
  const canSelectAll = onSelectAll !== undefined && selection.count < selection.total

  return (
    <>
      {actions && <span className="flex items-center gap-0.5">{actions}</span>}
      {actions && <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-border" />}

      <SwapText id={selection.count} className="text-sm font-medium tabular-nums text-body">
        {labels.selected(selection.count)}
      </SwapText>

      {canSelectAll && (
        <Button
          variant="outline"
          onClick={onSelectAll}
          className={cn(
            DATA_TABLE_TOOLBAR_BUTTON,
            'border-primary text-primary-deep hover:border-primary dark:text-primary',
          )}
        >
          {labels.selectAll(selection.total)}
        </Button>
      )}

      {onUnselectAll && (
        <PillButton variant="primary" size="sm" onClick={onUnselectAll} className="gap-1.5 pr-3">
          {labels.clear}
          <XIcon aria-hidden className="size-4" />
        </PillButton>
      )}
    </>
  )
}
