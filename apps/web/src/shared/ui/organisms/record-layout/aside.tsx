'use client'

import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

type RecordLayoutAsideProps = {
  readonly children: ReactNode
  readonly footer?: ReactNode
  readonly className?: string
}

export function RecordLayoutAside({
  children,
  footer,
  className,
}: Readonly<RecordLayoutAsideProps>) {
  return (
    <aside
      data-slot="record-layout-aside"
      className={cn(
        'flex w-full shrink-0 flex-col border-r border-border bg-background md:w-[var(--record-aside-width)]',
        className,
      )}
    >
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]">
        {children}
      </div>
      {footer ? (
        <div
          data-slot="record-layout-aside-footer"
          className="flex shrink-0 items-center gap-2 border-t border-border px-4 py-3"
        >
          {footer}
        </div>
      ) : null}
    </aside>
  )
}
