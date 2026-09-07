'use client'

import { cn } from '@/shared/lib'
import { WarningIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

type AlertMarkProps = {
  readonly hint: string
  readonly className?: string
}

export function AlertMark({ hint, className }: Readonly<AlertMarkProps>) {
  return (
    <HintTooltip asChild hint={hint}>
      <span
        role="img"
        aria-label={hint}
        tabIndex={0}
        data-slot="alert-mark"
        className={cn(
          'inline-flex shrink-0 cursor-help items-center justify-center rounded-full text-negative outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-3.5',
          className,
        )}
      >
        <WarningIcon strokeWidth={2.25} />
      </span>
    </HintTooltip>
  )
}
