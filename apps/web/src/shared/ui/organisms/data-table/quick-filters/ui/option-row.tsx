'use client'

import { cn } from '@/shared/lib/cn'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { SmoothCheckboxGlyph } from '@/shared/ui/smoothui/checkbox'

import type { QuickFilterOption } from '../model/types'

interface OptionRowProps {
  readonly option: QuickFilterOption
  readonly checked: boolean
  readonly onToggle: () => void
}

export function OptionRow({ option, checked, onToggle }: Readonly<OptionRowProps>) {
  const row = (
    <PillButton
      variant="ghost"
      size="sm"
      onClick={onToggle}
      aria-pressed={checked}
      className="h-8 w-full shrink-0 justify-start gap-2.5 rounded-md px-2.5 font-normal"
    >
      <SmoothCheckboxGlyph checked={checked} />
      <span className="flex-1 truncate text-left">{option.label}</span>
      {option.count !== undefined && (
        <span
          className={cn(
            'inline-flex h-5.5 min-w-6 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-medium tabular-nums',
            checked ? 'bg-primary-pale text-primary-deep' : 'bg-muted text-muted-foreground',
          )}
        >
          {option.count}
        </span>
      )}
    </PillButton>
  )

  if (!option.hint) return row

  return (
    <HintTooltip asChild hint={option.hint} side="right">
      {row}
    </HintTooltip>
  )
}
