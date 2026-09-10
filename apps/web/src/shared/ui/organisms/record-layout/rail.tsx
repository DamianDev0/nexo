'use client'

import { cn } from '@/shared/lib'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import { useRecordLayoutContext } from './context'

import type { RailItem } from './types'

type RecordLayoutRailProps = {
  readonly items: ReadonlyArray<RailItem>
  readonly className?: string
}

export function RecordLayoutRail({ items, className }: Readonly<RecordLayoutRailProps>) {
  const { activePanel, togglePanel } = useRecordLayoutContext()

  return (
    <nav
      data-slot="record-layout-rail"
      className={cn(
        'flex w-[var(--record-rail-width)] shrink-0 flex-col items-center gap-1 border-l border-border bg-background py-2',
        className,
      )}
    >
      {items.map((item) => {
        const active = activePanel === item.id
        return (
          <HintTooltip key={item.id} asChild hint={item.label}>
            <button
              type="button"
              aria-label={item.label}
              aria-pressed={active}
              onClick={() => togglePanel(item.id)}
              data-slot="record-layout-rail-item"
              data-state={active ? 'active' : 'inactive'}
              className={cn(
                'relative flex size-9 items-center justify-center rounded-lg transition-colors',
                'outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {item.icon}
              {item.count === undefined ? null : (
                <span
                  aria-hidden
                  className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-md bg-primary px-1 text-[10px] leading-none font-semibold tabular-nums text-primary-foreground ring-2 ring-background"
                >
                  {item.count}
                </span>
              )}
              {item.count === undefined && item.attention ? (
                <span
                  aria-hidden
                  className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-destructive ring-2 ring-background"
                />
              ) : null}
            </button>
          </HintTooltip>
        )
      })}
    </nav>
  )
}
