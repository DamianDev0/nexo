'use client'

import { CheckIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/shadcn/tooltip'

import type { QuickFilterOption } from './types'

interface OptionRowProps {
  readonly option: QuickFilterOption
  readonly checked: boolean
  readonly onToggle: () => void
}

export function OptionRow({ option, checked, onToggle }: Readonly<OptionRowProps>) {
  const row = (
    <GroovyPopover.Item
      active={checked}
      onSelect={onToggle}
      content={{
        label: option.label,
        icon: option.icon ?? CheckIcon,
        trailing:
          option.count === undefined ? undefined : (
            <span className="shrink-0 rounded-md bg-background/70 px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
              {option.count}
            </span>
          ),
      }}
    />
  )

  if (!option.hint) return row

  return (
    <Tooltip>
      <TooltipTrigger asChild>{row}</TooltipTrigger>
      <TooltipContent side="right" className="max-w-56">
        {option.hint}
      </TooltipContent>
    </Tooltip>
  )
}
