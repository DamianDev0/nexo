'use client'

import { formatShortcut } from '@/shared/lib/keyboard'
import { Kbd, KbdGroup } from '@/shared/ui/atoms/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/shadcn/tooltip'

import type { ReactElement, ReactNode } from 'react'

export type ToolbarHint = {
  readonly label: ReactNode
  readonly keys?: readonly string[]
  readonly side?: 'top' | 'bottom' | 'left' | 'right'
}

type ToolbarHintTipProps = {
  readonly hint?: ToolbarHint
  readonly children: ReactElement
}

export function ToolbarHintTip({ hint, children }: Readonly<ToolbarHintTipProps>) {
  if (!hint) return children
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={hint.side ?? 'top'} sideOffset={8} className="flex items-center gap-2">
        <span className="text-pretty">{hint.label}</span>
        {hint.keys?.length ? (
          <KbdGroup>
            {formatShortcut(hint.keys).map((key) => (
              <Kbd key={key} className="bg-background/20 text-background">
                {key}
              </Kbd>
            ))}
          </KbdGroup>
        ) : null}
      </TooltipContent>
    </Tooltip>
  )
}
