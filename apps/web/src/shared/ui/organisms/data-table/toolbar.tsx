import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

export function TableToolbar({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div
      data-slot="table-toolbar"
      className={cn('flex items-center gap-2.5 px-7 pb-5 pt-6', className)}
    >
      {children}
    </div>
  )
}

export function TableSearchPill({ placeholder }: Readonly<{ placeholder: string }>) {
  return (
    <div className="flex h-10.5 max-w-80 flex-1 items-center gap-2 rounded-full bg-muted px-4.5 text-[15px] text-muted-foreground">
      <span className="text-faint">⌕</span>
      {placeholder}
    </div>
  )
}

export function TableBulkBar({
  label,
  children,
  className,
}: Readonly<{ label: string; children: ReactNode; className?: string }>) {
  return (
    <div
      data-slot="table-bulk-bar"
      className={cn(
        'mx-7 mb-1 flex items-center justify-between rounded-full bg-primary-pale py-2.5 pl-5 pr-3',
        className,
      )}
    >
      <span className="text-sm font-black text-primary-deep">{label}</span>
      <div className="flex gap-2">{children}</div>
    </div>
  )
}

export function TableBulkAction({
  destructive,
  children,
}: Readonly<{ destructive?: boolean; children: ReactNode }>) {
  return (
    <button
      type="button"
      className={cn(
        'flex h-8.5 cursor-pointer items-center rounded-full bg-card px-4 text-[13px] font-bold',
        destructive ? 'text-negative-text' : 'text-foreground',
      )}
    >
      {children}
    </button>
  )
}
