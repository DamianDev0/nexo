'use client'

import { cn } from '@/shared/lib'
import { Input } from '@/shared/ui/shadcn/input'
import { Textarea } from '@/shared/ui/shadcn/textarea'

import type { ComponentProps } from 'react'

export function ComposerInput({ className, ...props }: Readonly<ComponentProps<typeof Input>>) {
  return (
    <Input
      data-slot="composer-input"
      className={cn(
        'h-8 rounded-none border-none bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent',
        className,
      )}
      {...props}
    />
  )
}

export function ComposerTextarea({
  className,
  ...props
}: Readonly<ComponentProps<typeof Textarea>>) {
  return (
    <Textarea
      data-slot="composer-textarea"
      className={cn(
        'min-h-32 resize-none rounded-none border-none bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent',
        className,
      )}
      {...props}
    />
  )
}
