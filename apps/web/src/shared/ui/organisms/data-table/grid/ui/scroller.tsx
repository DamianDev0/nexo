'use client'

import { useState } from 'react'

import { cn } from '@/shared/lib'

import type { ReactNode, RefObject, UIEvent } from 'react'

interface DataTableScrollerProps {
  readonly children: ReactNode
  readonly ref?: RefObject<HTMLDivElement | null>
  readonly hideScrollbar?: boolean
  readonly className?: string
}

export function DataTableScroller({
  children,
  ref,
  hideScrollbar,
  className,
}: Readonly<DataTableScrollerProps>) {
  const [scrolled, setScrolled] = useState(false)

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const next = event.currentTarget.scrollLeft > 0
    setScrolled((prev) => (prev === next ? prev : next))
  }

  return (
    <div
      ref={ref}
      data-slot="table-scroller"
      data-scrolled={scrolled || undefined}
      onScroll={handleScroll}
      className={cn(
        'group/scroller min-w-0 overflow-auto [&_[data-slot=table-container]]:overflow-visible',
        hideScrollbar && '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}
