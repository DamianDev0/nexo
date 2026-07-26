'use client'

import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

export function DataTableBulkBar({
  label,
  children,
  className,
}: Readonly<{ label: string; children: ReactNode; className?: string }>) {
  return (
    <div
      data-slot="table-bulk-bar"
      className={cn(
        'mx-4 mb-1 flex items-center justify-between rounded-full bg-primary-pale py-2.5 pl-5 pr-3',
        className,
      )}
    >
      <span className="text-sm font-black text-primary-deep">{label}</span>
      <div className="flex gap-2">{children}</div>
    </div>
  )
}

export function DataTableBulkAction({
  destructive,
  onClick,
  children,
}: Readonly<{ destructive?: boolean; onClick?: () => void; children: ReactNode }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8.5 cursor-pointer items-center rounded-full bg-card px-4 text-[13px] font-bold',
        destructive ? 'text-negative-text' : 'text-foreground',
      )}
    >
      {children}
    </button>
  )
}
