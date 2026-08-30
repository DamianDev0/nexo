'use client'

import { LockIcon } from '@/shared/ui/icons'

import { HintTooltip } from './hint-tooltip'

interface LockedHintProps {
  readonly hint?: string
}

export function LockedHint({ hint }: Readonly<LockedHintProps>) {
  return (
    <HintTooltip asChild hint={hint}>
      <span className="flex size-8 items-center justify-center text-muted-foreground">
        <LockIcon className="size-3.5" />
      </span>
    </HintTooltip>
  )
}
