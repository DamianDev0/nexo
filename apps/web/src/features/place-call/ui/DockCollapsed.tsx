'use client'

import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Wordmark } from '@/shared/ui/atoms/wordmark'
import { PhoneIcon } from '@/shared/ui/icons'

import type { HTMLAttributes } from 'react'

type DockCollapsedProps = {
  readonly tone: string
  readonly label: string
  readonly onOpen: () => void
  readonly dragProps?: HTMLAttributes<HTMLButtonElement>
}

export function DockCollapsed({ tone, label, onOpen, dragProps }: Readonly<DockCollapsedProps>) {
  return (
    <PillButton
      {...dragProps}
      data-drag-handle=""
      variant="secondary"
      size="xs"
      aria-label={label}
      onClick={onOpen}
      className="cursor-grab gap-2 rounded-full border border-border bg-card px-3.5 shadow-e2 select-none hover:bg-muted active:cursor-grabbing"
    >
      <span aria-hidden className={cn('size-2 rounded-full', tone)} />
      <PhoneIcon className="size-3.5" />
      <Wordmark dot={false} className="[&>span]:text-xs" />
    </PillButton>
  )
}
