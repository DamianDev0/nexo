'use client'

import { cn } from '@/shared/lib/cn'
import { DialogFooter } from '@/shared/ui/shadcn/dialog'

import type { ComponentProps } from 'react'

export function DialogActions({ className, ...props }: Readonly<ComponentProps<'div'>>) {
  return (
    <DialogFooter
      className={cn(
        '-mx-6 -mb-6 mt-2 items-center rounded-b-lg border-t border-border bg-muted/40 px-6 py-4',
        className,
      )}
      {...props}
    />
  )
}
