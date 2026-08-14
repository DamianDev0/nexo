'use client'

import { cn } from '@/shared/lib'

import type { ReactNode, RefObject } from 'react'

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
  return (
    <div
      ref={ref}
      data-slot="table-scroller"
      className={cn(
        'min-w-0 overflow-auto',
        hideScrollbar && '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      <div className="min-w-max">{children}</div>
    </div>
  )
}
