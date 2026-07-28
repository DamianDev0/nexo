'use client'

import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

export interface SmartListItem {
  readonly id: string
  readonly label: string
  readonly count?: number
}

interface SmartListsData {
  readonly items: ReadonlyArray<SmartListItem>
  readonly activeId: string
}

interface SmartListsProps {
  readonly data: SmartListsData
  readonly onSelect: (id: string) => void
  readonly children?: ReactNode
  readonly className?: string
}

export function DataTableSmartLists({
  data,
  onSelect,
  children,
  className,
}: Readonly<SmartListsProps>) {
  return (
    <div
      data-slot="table-smart-lists"
      className={cn('flex items-center gap-1 border-b border-border px-4', className)}
    >
      {data.items.map((item) => {
        const active = item.id === data.activeId
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active || undefined}
            onClick={() => onSelect(item.id)}
            className={cn(
              'relative -mb-px inline-flex h-11.5 cursor-pointer items-center gap-2 border-b-2 px-3 text-[15px]',
              active
                ? 'border-foreground font-bold text-foreground'
                : 'border-transparent font-medium text-muted-foreground hover:text-body',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'inline-flex h-5.5 min-w-5.5 items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums',
                  active ? 'bg-primary-pale text-primary-deep' : 'bg-muted text-muted-foreground',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
      {children && <span className="ml-auto flex items-center gap-2 py-1.5">{children}</span>}
    </div>
  )
}
