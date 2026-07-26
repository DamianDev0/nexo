import { cn } from '@/shared/lib'

import { Amount } from '../atoms/amount'
import { BadgeSoft } from '../atoms/badge-soft'

import type { ComponentProps } from 'react'

interface KpiDelta {
  readonly tone: ComponentProps<typeof BadgeSoft>['tone']
  readonly label: string
}

interface KpiCardData {
  readonly label: string
  readonly cents?: number
  readonly figure?: string
  readonly delta?: KpiDelta
  readonly note?: string
}

interface KpiCardProps {
  readonly data: KpiCardData
  readonly inverted?: boolean
  readonly className?: string
}

export function KpiCard({ data, inverted, className }: Readonly<KpiCardProps>) {
  return (
    <article
      data-slot="kpi-card"
      className={cn(
        'rounded-xl p-6.5',
        inverted ? 'bg-sidebar text-sidebar-foreground' : 'bg-card text-foreground',
        className,
      )}
    >
      <p
        className={cn(
          'text-[10.5px] font-black uppercase tracking-[0.14em]',
          inverted ? 'text-faint' : 'text-muted-foreground',
        )}
      >
        {data.label}
      </p>
      <div className="mt-4">
        {data.cents === undefined ? (
          <span className="text-4xl font-black leading-none tracking-[-0.04em] tabular-nums">
            {data.figure}
          </span>
        ) : (
          <Amount
            cents={data.cents}
            variant="compact"
            className={cn(inverted && 'text-sidebar-foreground')}
          />
        )}
      </div>
      <div className="mt-3.5 min-h-7">
        {data.delta && <BadgeSoft tone={data.delta.tone}>{data.delta.label}</BadgeSoft>}
        {!data.delta && data.note && (
          <span className={cn('text-[13px]', inverted ? 'text-faint' : 'text-muted-foreground')}>
            {data.note}
          </span>
        )}
      </div>
    </article>
  )
}
