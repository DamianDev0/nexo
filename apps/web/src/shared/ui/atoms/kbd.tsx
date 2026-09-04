import { cn } from '@/shared/lib'

import type { ComponentProps } from 'react'

export function Kbd({ className, ...props }: Readonly<ComponentProps<'kbd'>>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-sm bg-muted px-1 font-sans text-[11px] font-medium text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function KbdGroup({ className, ...props }: Readonly<ComponentProps<'span'>>) {
  return (
    <span
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  )
}
