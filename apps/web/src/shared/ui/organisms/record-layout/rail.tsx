'use client'

import { cn } from '@/shared/lib'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import { useRecordLayoutContext } from './context'

import type { RailItem } from './types'

type RecordLayoutRailProps = {
  readonly items: ReadonlyArray<RailItem>
  readonly className?: string
}

function RailBadge({ count, attention }: Readonly<{ count?: number; attention?: boolean }>) {
  if (count !== undefined) {
    return (
      <span
        aria-hidden
        className={cn(
          'absolute -top-0.5 -right-0.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1',
          'text-[10px] leading-none font-bold tabular-nums ring-2 ring-background',
          attention
            ? 'bg-destructive text-destructive-foreground'
            : 'bg-primary text-primary-foreground',
        )}
      >
        {count}
      </span>
    )
  }

  if (!attention) return null

  return (
    <span
      aria-hidden
      className="absolute top-0.5 right-0.5 size-2 rounded-full bg-destructive ring-2 ring-background"
    />
  )
}

export function RecordLayoutRail({ items, className }: Readonly<RecordLayoutRailProps>) {
  const { activePanel, togglePanel } = useRecordLayoutContext()

  return (
    <nav
      data-slot="record-layout-rail"
      className={cn(
        'flex w-[var(--record-rail-width)] shrink-0 flex-col items-center gap-1.5 border-l border-border bg-background px-2 py-3',
        className,
      )}
    >
      {items.map((item) => {
        const active = activePanel === item.id
        return (
          <HintTooltip key={item.id} asChild side="left" hint={item.label}>
            <button
              type="button"
              aria-label={item.label}
              aria-pressed={active}
              onClick={() => togglePanel(item.id)}
              data-slot="record-layout-rail-item"
              data-state={active ? 'active' : 'inactive'}
              className={cn(
                'relative flex size-10 items-center justify-center rounded-xl transition-colors [&_svg]:size-4.5',
                'outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                active
                  ? 'bg-primary-pale text-primary-deep'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute top-1/2 -left-2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                />
              ) : null}
              {item.icon}
              <RailBadge count={item.count} attention={item.attention} />
            </button>
          </HintTooltip>
        )
      })}
    </nav>
  )
}
