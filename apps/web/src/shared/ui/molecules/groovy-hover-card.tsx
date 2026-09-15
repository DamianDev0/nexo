'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/shared/lib'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'

import type { ReactNode } from 'react'

const OPEN_DELAY_MS = 150
const CLOSE_DELAY_MS = 100

type GroovyHoverCardProps = {
  readonly children: ReactNode
  readonly content: ReactNode
  readonly align?: 'start' | 'center' | 'end'
  readonly className?: string
  readonly onOpen?: () => void
}

export function GroovyHoverCard({
  children,
  content,
  align = 'start',
  className,
  onOpen,
}: Readonly<GroovyHoverCardProps>) {
  const [open, setOpen] = useState(false)
  const timerRef = useRef<number | null>(null)

  const schedule = useCallback(
    (next: boolean) => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(
        () => {
          setOpen(next)
          if (next) onOpen?.()
        },
        next ? OPEN_DELAY_MS : CLOSE_DELAY_MS,
      )
    },
    [onOpen],
  )

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  return (
    <GroovyPopover open={open} onOpenChange={setOpen}>
      <GroovyPopover.Anchor asChild>
        <span
          className="inline-flex"
          onMouseEnter={() => schedule(true)}
          onMouseLeave={() => schedule(false)}
          onFocus={() => schedule(true)}
          onBlur={() => schedule(false)}
        >
          {children}
        </span>
      </GroovyPopover.Anchor>
      <GroovyPopover.Content
        subtle
        align={align}
        className={cn('z-30', className)}
        onMouseEnter={() => schedule(true)}
        onMouseLeave={() => schedule(false)}
      >
        {content}
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
