'use client'

import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import type { ReactNode } from 'react'

type CallControlProps = {
  readonly label: string
  readonly icon: ReactNode
  readonly active?: boolean
  readonly disabled?: boolean
  readonly onPress: () => void
}

export function CallControl({
  label,
  icon,
  active,
  disabled,
  onPress,
}: Readonly<CallControlProps>) {
  return (
    <span className="flex flex-col items-center gap-1.5">
      <PillButton
        variant="ghost"
        size="md"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onPress}
        className={cn(
          'size-13 rounded-full px-0',
          active
            ? 'bg-primary/20 text-primary-deep hover:bg-primary/25 dark:text-primary'
            : 'bg-muted text-foreground hover:bg-accent',
        )}
      >
        {icon}
      </PillButton>
      <Text className="text-xs font-medium text-body">{label}</Text>
    </span>
  )
}

export function GhostControl({
  label,
  icon,
  hint,
}: Readonly<{ label: string; icon: ReactNode; hint: string }>) {
  return (
    <span className="flex flex-col items-center gap-1.5">
      <HintTooltip asChild hint={hint}>
        <span>
          <PillButton
            variant="ghost"
            size="md"
            aria-label={label}
            disabled
            className="size-13 rounded-full bg-muted px-0 text-foreground"
          >
            {icon}
          </PillButton>
        </span>
      </HintTooltip>
      <Text className="text-xs font-medium text-body">{label}</Text>
    </span>
  )
}
