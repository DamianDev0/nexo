import { cn } from '@/shared/lib/cn'

import type { ReactNode } from 'react'

interface PanelStackProps {
  readonly children: ReactNode
  readonly className?: string
}

export function PanelStack({ children, className }: Readonly<PanelStackProps>) {
  return (
    <div
      className={cn(
        'divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-xs',
        className,
      )}
    >
      {children}
    </div>
  )
}
