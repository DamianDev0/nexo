import { cn } from '@/shared/lib'
import { Text } from '@/shared/ui/atoms/text'

import type { ReactNode } from 'react'

type RecordDrawerHighlightProps = {
  readonly label: string
  readonly value: ReactNode
  readonly meta?: ReactNode
  readonly className?: string
}

export function RecordDrawerHighlight({
  label,
  value,
  meta,
  className,
}: Readonly<RecordDrawerHighlightProps>) {
  return (
    <div
      data-slot="record-drawer-highlight"
      className={cn(
        'flex items-center justify-between gap-3 border-y border-border bg-muted/30 px-4 py-2',
        className,
      )}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <Text variant="fine">{label}</Text>
        <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-foreground">
          {value}
        </span>
      </span>
      {meta ? (
        <Text variant="hint" className="shrink-0 tabular-nums">
          {meta}
        </Text>
      ) : null}
    </div>
  )
}
