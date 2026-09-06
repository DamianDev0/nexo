'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { ActionDock } from '@/shared/ui/molecules/action-dock'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'

import type { ActionDockItem } from '@/shared/ui/molecules/action-dock'
import type { ReactNode } from 'react'

const HINT_DELAY = 100
const DOCK_OPEN_DELAY_MS = 150
const DOCK_CLOSE_GRACE_MS = 120

let closeActiveDock: (() => void) | null = null

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

export type CellActionMenu = {
  readonly label: string
  readonly items: ReadonlyArray<ActionDockItem>
}

interface DataTableCellFrameProps {
  readonly display: ReactNode
  readonly numeric?: boolean
  readonly dense?: boolean
  readonly hint?: ReactNode
  readonly actions: CellActionMenu
}

export function DataTableCellFrame({
  display,
  numeric,
  dense,
  hint,
  actions,
}: Readonly<DataTableCellFrameProps>) {
  const [open, setOpen] = useState(false)
  const timerRef = useRef<number | null>(null)

  const close = useCallback(() => setOpen(false), [])

  const schedule = useCallback(
    (next: boolean, delay: number) => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        if (next) {
          if (closeActiveDock !== null && closeActiveDock !== close) closeActiveDock()
          closeActiveDock = close
        } else if (closeActiveDock === close) {
          closeActiveDock = null
        }
        setOpen(next)
      }, delay)
    },
    [close],
  )

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next && closeActiveDock === close) closeActiveDock = null
      setOpen(next)
    },
    [close],
  )

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      if (closeActiveDock === close) closeActiveDock = null
    },
    [close],
  )

  return (
    <GroovyPopover open={open} onOpenChange={handleOpenChange}>
      <GroovyPopover.Anchor asChild>
        <span
          onMouseEnter={() => schedule(true, DOCK_OPEN_DELAY_MS)}
          onMouseLeave={() => schedule(false, DOCK_CLOSE_GRACE_MS)}
          className={cn('flex h-full w-full min-w-0 items-center', dense ? 'gap-1' : 'gap-1.5')}
        >
          <TruncateTip className={numeric ? 'tabular-nums text-muted-foreground' : undefined}>
            {display}
          </TruncateTip>
          {hint}
        </span>
      </GroovyPopover.Anchor>
      <GroovyPopover.Content
        subtle
        side="top"
        align="end"
        sideOffset={2}
        className="rounded-lg p-0.5"
        onMouseEnter={() => schedule(true, 0)}
        onMouseLeave={() => schedule(false, DOCK_CLOSE_GRACE_MS)}
      >
        <ActionDock
          items={actions.items}
          label={actions.label}
          className="border-0 bg-transparent p-0 shadow-none"
        />
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
