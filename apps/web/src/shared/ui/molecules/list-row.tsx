import { cn } from '@/shared/lib/cn'

import type { ComponentProps } from 'react'

export function ListRow({ className, ...props }: Readonly<ComponentProps<'div'>>) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5',
        className,
      )}
      {...props}
    />
  )
}
