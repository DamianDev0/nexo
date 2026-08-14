import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

export function DataTableScroller({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div data-slot="table-scroller" className={cn('overflow-x-auto', className)}>
      <div className="min-w-max">{children}</div>
    </div>
  )
}
