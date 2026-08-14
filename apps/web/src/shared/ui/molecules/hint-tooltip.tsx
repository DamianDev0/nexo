'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/shadcn/tooltip'

import type { ReactNode } from 'react'

const TEXT_TRIGGER =
  'max-w-full cursor-help truncate rounded-sm text-left decoration-muted-foreground/50 decoration-dotted underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

interface HintTooltipProps {
  readonly hint: ReactNode
  readonly children: ReactNode
  readonly asChild?: boolean
  readonly side?: 'top' | 'bottom' | 'left' | 'right'
  readonly delayDuration?: number
}

export function HintTooltip({
  hint,
  children,
  asChild,
  side = 'top',
  delayDuration,
}: Readonly<HintTooltipProps>) {
  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild={asChild} className={asChild ? undefined : TEXT_TRIGGER}>
        {children}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        align={asChild ? 'center' : 'start'}
        sideOffset={6}
        className="max-w-64 text-pretty"
      >
        <span className="line-clamp-5 block whitespace-pre-line">{hint}</span>
      </TooltipContent>
    </Tooltip>
  )
}
