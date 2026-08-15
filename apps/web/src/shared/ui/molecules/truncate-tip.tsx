'use client'

import { useCallback, useRef, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { Tooltip, TooltipTrigger } from '@/shared/ui/shadcn/tooltip'

import { HintContent } from './hint-content'

import type { ReactNode } from 'react'

interface TruncateTipProps {
  readonly children: ReactNode
  readonly hint?: ReactNode
  readonly side?: 'top' | 'bottom' | 'left' | 'right'
  readonly className?: string
}

export function TruncateTip({
  children,
  hint,
  side = 'top',
  className,
}: Readonly<TruncateTipProps>) {
  const ref = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [armed, setArmed] = useState(false)

  const handleEnter = useCallback(() => {
    const element = ref.current
    const overflows = element ? element.scrollWidth > element.clientWidth + 1 : false
    if (hint === undefined && !overflows) return
    setArmed(true)
    setOpen(true)
  }, [hint])

  const label = (
    <span
      ref={ref}
      onPointerEnter={handleEnter}
      onPointerLeave={() => setOpen(false)}
      className={cn('block min-w-0 truncate', armed && 'cursor-pointer', className)}
    >
      {children}
    </span>
  )

  if (!armed) return label

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>{label}</TooltipTrigger>
      <HintContent side={side}>{hint ?? children}</HintContent>
    </Tooltip>
  )
}
