'use client'

import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

type RecordLayoutMainProps = {
  readonly children: ReactNode
  readonly className?: string
}

export function RecordLayoutMain({ children, className }: Readonly<RecordLayoutMainProps>) {
  return (
    <div
      data-slot="record-layout-main"
      className={cn('flex min-w-0 flex-1 flex-col bg-background', className)}
    >
      {children}
    </div>
  )
}

type RecordLayoutTabsProps = {
  readonly children: ReactNode
  readonly end?: ReactNode
  readonly className?: string
}

export function RecordLayoutTabs({ children, end, className }: Readonly<RecordLayoutTabsProps>) {
  return (
    <div
      data-slot="record-layout-tabs"
      className={cn(
        'flex shrink-0 items-center gap-3 border-b border-border px-4 py-2.5',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center">{children}</div>
      {end ? <div className="flex shrink-0 items-center gap-1.5">{end}</div> : null}
    </div>
  )
}

type RecordLayoutContentProps = {
  readonly children: ReactNode
  readonly className?: string
}

export function RecordLayoutContent({ children, className }: Readonly<RecordLayoutContentProps>) {
  return (
    <div
      data-slot="record-layout-content"
      className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]"
    >
      <div className={cn('flex flex-col gap-4 px-4 py-4', className)}>{children}</div>
    </div>
  )
}
