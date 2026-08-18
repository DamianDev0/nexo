import { cn } from '@/shared/lib/cn'

import type { ReactNode } from 'react'

interface NoteProps {
  readonly children: ReactNode
  readonly className?: string
}

export function Note({ children, className }: Readonly<NoteProps>) {
  return (
    <span
      className={cn('rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground', className)}
    >
      {children}
    </span>
  )
}
