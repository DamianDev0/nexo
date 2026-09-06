'use client'

import { cn } from '@/shared/lib/cn'
import { DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/shadcn/dialog'

import type { ReactNode } from 'react'

type DialogHeadingProps = {
  readonly title: ReactNode
  readonly description?: ReactNode
  readonly className?: string
}

export function DialogHeading({ title, description, className }: Readonly<DialogHeadingProps>) {
  return (
    <DialogHeader
      className={cn(
        '-mx-6 -mt-6 gap-1 rounded-t-lg border-b border-border bg-muted/40 px-6 py-4 pr-14',
        className,
      )}
    >
      <DialogTitle className="text-base">{title}</DialogTitle>
      {description !== undefined && (
        <DialogDescription className="[&_strong]:font-semibold [&_strong]:text-foreground">
          {description}
        </DialogDescription>
      )}
    </DialogHeader>
  )
}
