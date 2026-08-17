'use client'

import { cn } from '@/shared/lib/cn'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'

import { DataTableCellActions } from './cell-actions'

import type { ReactNode } from 'react'

const HINT_DELAY = 100

export function DataTableCellHint({
  hint,
  children,
}: Readonly<{ hint: string; children: ReactNode }>) {
  return (
    <HintTooltip asChild hint={hint} delayDuration={HINT_DELAY}>
      <span
        role="img"
        aria-label={hint}
        className="flex size-4 shrink-0 cursor-help items-center justify-center"
      >
        {children}
      </span>
    </HintTooltip>
  )
}

interface DataTableCellFrameProps {
  readonly display: ReactNode
  readonly numeric?: boolean
  readonly dense?: boolean
  readonly children: ReactNode
}

export function DataTableCellFrame({
  display,
  numeric,
  dense,
  children,
}: Readonly<DataTableCellFrameProps>) {
  const value = (
    <TruncateTip className={numeric ? 'tabular-nums text-muted-foreground' : undefined}>
      {display}
    </TruncateTip>
  )
  const actions = (
    <DataTableCellActions className={cn('[&_a,&_button]:size-5', !dense && '-ml-0.5 gap-1')}>
      {children}
    </DataTableCellActions>
  )

  if (dense) {
    return (
      <span className="flex min-w-0 items-center justify-between gap-1">
        {value}
        {actions}
      </span>
    )
  }

  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      {value}
      {actions}
    </span>
  )
}
