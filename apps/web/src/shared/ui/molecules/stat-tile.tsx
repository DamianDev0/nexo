'use client'

import { cn } from '@/shared/lib/cn'
import { Text } from '@/shared/ui/atoms/text'

export type StatTone = 'neutral' | 'ready' | 'warning' | 'error'

interface StatTileProps {
  readonly value: number
  readonly label: string
  readonly tone?: StatTone
  readonly centered?: boolean
}

const TONE: Readonly<Record<StatTone, string>> = {
  neutral: 'text-foreground',
  ready: 'text-positive-text',
  warning: 'text-warning-text',
  error: 'text-negative-text',
}

export function StatTile({ value, label, tone = 'neutral', centered }: Readonly<StatTileProps>) {
  return (
    <span
      className={cn(
        'flex flex-1 flex-col gap-0.5 rounded-lg border border-border px-4 py-3',
        centered && 'items-center',
      )}
    >
      <span className={cn('text-xl font-semibold tabular-nums', TONE[tone])}>{value}</span>
      <Text variant="hint">{label}</Text>
    </span>
  )
}
