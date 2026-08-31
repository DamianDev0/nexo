'use client'

import { cn } from '@/shared/lib/cn'
import { DialogFooter } from '@/shared/ui/shadcn/dialog'

import type { ComponentProps } from 'react'

export function DialogActions({ className, ...props }: Readonly<ComponentProps<'div'>>) {
  return (
    <DialogFooter
      className={cn('-mx-6 -mt-1 -mb-2 border-t border-border px-6 pt-3', className)}
      {...props}
    />
  )
}
