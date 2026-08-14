'use client'

import { flexRender } from '@tanstack/react-table'

import { cn } from '@/shared/lib'

import { useDataTableContext } from './context'

export function DataTableBody({ className }: Readonly<{ className?: string }>) {
  const { table } = useDataTableContext()

  return (
    <div data-slot="table-body" className={className}>
      {table.getRowModel().rows.map((row) => (
        <div
          key={row.id}
          data-selected={row.getIsSelected() || undefined}
          className={cn(
            'flex h-16 items-center gap-2 border-b border-row-divider px-4 last:border-b-0',
            row.getIsSelected() ? 'bg-row-selected' : 'hover:bg-row-hover',
          )}
        >
          {row.getVisibleCells().map((cell) => (
            <div
              key={cell.id}
              style={{
                width: cell.column.getSize(),
                flexGrow: cell.column.columnDef.meta?.grow ? 1 : 0,
              }}
              className="flex min-w-0 shrink-0 items-center px-1.5 text-[15px] text-body"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function DataTableRowTitle({
  title,
  subtitle,
}: Readonly<{ title: string; subtitle: string }>) {
  return (
    <div className="min-w-0">
      <div className="truncate text-[15px] font-bold leading-[1.35] text-foreground">{title}</div>
      <div className="truncate text-[13px] text-muted-foreground">{subtitle}</div>
    </div>
  )
}
