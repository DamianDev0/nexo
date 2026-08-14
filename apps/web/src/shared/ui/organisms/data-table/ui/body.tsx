'use client'

import { flexRender } from '@tanstack/react-table'

import { cn } from '@/shared/lib'

import { DATA_TABLE_GUTTER } from '../config/table.constants'
import { useDataTableContext } from '../model/context'

import { cellAlignment } from './cell-align'

import type { ReactNode } from 'react'

export function DataTableBody({ className }: Readonly<{ className?: string }>) {
  const { table } = useDataTableContext()

  return (
    <div data-slot="table-body" className={className}>
      {table.getRowModel().rows.map((row) => (
        <div
          key={row.id}
          data-selected={row.getIsSelected() || undefined}
          className={cn(
            'flex h-14 items-center gap-2 border-b border-row-divider transition-colors last:border-b-0',
            DATA_TABLE_GUTTER,
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
              className={cn(
                'flex min-w-0 shrink-0 items-center px-2 text-sm text-body',
                cellAlignment(cell.column.columnDef),
              )}
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
}: Readonly<{ title: string; subtitle?: string }>) {
  return (
    <div className="min-w-0">
      <div className="truncate text-sm font-semibold leading-tight text-foreground">{title}</div>
      {subtitle && (
        <div className="truncate text-xs leading-tight text-muted-foreground">{subtitle}</div>
      )}
    </div>
  )
}

export function DataTableCellText({
  children,
  muted,
  numeric,
}: Readonly<{ children: ReactNode; muted?: boolean; numeric?: boolean }>) {
  if (children === null || children === undefined || children === '') {
    return <span className="text-faint">—</span>
  }

  return (
    <span
      className={cn(
        'truncate',
        muted && 'text-muted-foreground',
        numeric && 'tabular-nums text-muted-foreground',
      )}
    >
      {children}
    </span>
  )
}
