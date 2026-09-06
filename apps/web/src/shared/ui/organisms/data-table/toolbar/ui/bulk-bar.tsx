'use client'

import { XIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'

import { useDataTableContext } from '../../model/context'

import type { DataTableBulkConfig } from '../model/types'

export function DataTableBulkBar({ labels, actions }: Readonly<DataTableBulkConfig>) {
  const { selection } = useDataTableContext()

  return (
    <>
      {actions && <span className="flex items-center gap-0.5">{actions}</span>}
      {actions && <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-border" />}

      <span className="text-sm font-medium tabular-nums text-body">
        {labels.selected(selection.count)}
      </span>

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
