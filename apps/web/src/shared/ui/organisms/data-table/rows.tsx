import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

export function TableHeader({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div
      data-slot="table-header"
      className={cn(
        'flex h-11 items-center gap-4 border-b border-border px-7',
        'text-[11px] font-black uppercase tracking-[0.12em] text-faint',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function TableRow({
  selected,
  children,
  className,
}: Readonly<{ selected?: boolean; children: ReactNode; className?: string }>) {
  return (
    <div
      data-slot="table-row"
      className={cn(
        'flex h-16 items-center gap-4 border-b border-row-divider px-7 last:border-b-0',
        selected ? 'bg-row-selected' : 'hover:bg-row-hover',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function TableCell({
  numeric,
  children,
  className,
}: Readonly<{ numeric?: boolean; children?: ReactNode; className?: string }>) {
  return (
    <div
      data-slot="table-cell"
      className={cn('min-w-0 flex-1 text-[15px] text-body', numeric && 'text-right', className)}
    >
      {children}
    </div>
  )
}

export function TableRowTitle({ title, subtitle }: Readonly<{ title: string; subtitle: string }>) {
  return (
    <div className="min-w-0">
      <div className="truncate text-[15px] font-bold leading-[1.35] text-foreground">{title}</div>
      <div className="truncate text-[13px] text-muted-foreground">{subtitle}</div>
    </div>
  )
}
