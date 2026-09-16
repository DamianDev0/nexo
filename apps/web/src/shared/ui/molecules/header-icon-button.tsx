'use client'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/shadcn/button'

import type { ComponentProps } from 'react'

type HeaderIconButtonProps = Omit<ComponentProps<typeof Button>, 'variant' | 'size'>

export function HeaderIconButton({ className, ...props }: Readonly<HeaderIconButtonProps>) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn(
        'text-foreground/60 transition-[colors,translate] hover:text-foreground active:translate-y-px',
        className,
      )}
      {...props}
    />
  )
}
