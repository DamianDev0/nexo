'use client'

import { cn } from '@/shared/lib'
import { PaperclipIcon, XIcon } from '@/shared/ui/icons'
import { formatFileSize } from '@/shared/ui/molecules/file-upload/constants'
import { Button } from '@/shared/ui/shadcn/button'

import { HIDDEN_WHEN_MINIMIZED } from './constants'

import type { ComponentProps } from 'react'

export function ComposerAttachments({ className, ...props }: Readonly<ComponentProps<'div'>>) {
  return (
    <div
      data-slot="composer-attachments"
      className={cn(
        'flex shrink-0 flex-wrap items-center gap-2 border-t px-4 py-2',
        HIDDEN_WHEN_MINIMIZED,
        className,
      )}
      {...props}
    />
  )
}

type ComposerAttachmentProps = {
  readonly name: string
  readonly size?: number
  readonly onRemove?: () => void
  readonly removeLabel?: string
}

export function ComposerAttachment({
  name,
  size,
  onRemove,
  removeLabel,
}: Readonly<ComposerAttachmentProps>) {
  return (
    <span
      data-slot="composer-attachment"
      className="flex max-w-60 items-center gap-1.5 rounded-md border bg-muted/40 py-1 pr-1 pl-2"
    >
      <PaperclipIcon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate text-xs font-medium text-foreground">{name}</span>
      {size === undefined ? null : (
        <span className="shrink-0 text-xs text-muted-foreground">{formatFileSize(size)}</span>
      )}
      {onRemove ? (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={removeLabel}
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground"
        >
          <XIcon />
        </Button>
      ) : null}
    </span>
  )
}
