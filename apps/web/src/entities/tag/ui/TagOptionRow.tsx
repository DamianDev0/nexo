'use client'

import { cn } from '@/shared/lib'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { CheckIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import type { TagOption } from '../lib/tag-options'

type TagOptionRowProps = {
  readonly option: TagOption
  readonly onToggle: (name: string) => void
}

export function TagOptionRow({ option, onToggle }: Readonly<TagOptionRowProps>) {
  const row = (
    <PillButton
      variant="ghost"
      size="xs"
      aria-pressed={option.selected}
      onClick={() => onToggle(option.name)}
      className={cn(
        'w-full justify-start gap-2 font-normal',
        option.selected &&
          'bg-secondary font-medium text-secondary-foreground hover:bg-secondary/80',
      )}
    >
      <ColorDot color={option.color ?? 'var(--muted-foreground)'} />
      <span className="min-w-0 flex-1 truncate text-left">{option.name}</span>
      {option.selected ? (
        <CheckIcon className="size-4 shrink-0 rounded-full bg-primary p-0.5 text-primary-foreground" />
      ) : null}
    </PillButton>
  )

  if (!option.description) return row
  return (
    <HintTooltip asChild side="right" hint={option.description}>
      {row}
    </HintTooltip>
  )
}
