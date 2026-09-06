'use client'

import { XIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'

import { useDataTableContext } from '../../model/context'

import type { DataTableBulkConfig } from '../model/types'

export function DataTableBulkBar({ labels, actions, onSelectAll }: Readonly<DataTableBulkConfig>) {
  const { selection } = useDataTableContext()
  const canSelectAll = onSelectAll !== undefined && selection.count < selection.total

  return (
    <>
      {actions && <span className="flex items-center gap-0.5">{actions}</span>}
      {actions && <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-border" />}

      <span className="text-sm font-medium tabular-nums text-body">
        {labels.selected(selection.count)}
      </span>

      {canSelectAll && (
        <Button
          variant="link"
          size="sm"
          onClick={onSelectAll}
          className="h-8 px-1.5 text-sm font-medium text-primary-deep dark:text-primary"
        >
          {labels.selectAll(selection.total)}
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={selection.clear}
        aria-label={labels.clear}
        className="ml-auto text-faint hover:text-foreground"
      >
        <XIcon className="size-4" />
      </Button>
    </>
  )
}
