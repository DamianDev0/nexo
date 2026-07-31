'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

import { cn } from '@/shared/lib'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/shadcn/tooltip'

import type { SmartListItem } from './smart-lists'

export function SmartListTabGhost({ item }: Readonly<{ item: SmartListItem }>) {
  return (
    <span className="inline-flex h-10 rotate-1 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-card px-3.5 text-sm font-medium text-foreground shadow-e3">
      <GripVertical className="-ml-1 size-3.5 text-primary" />
      {item.label}
      {item.count !== undefined && (
        <span className="inline-flex h-5.5 min-w-6 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-semibold tabular-nums text-muted-foreground">
          {item.count}
        </span>
      )}
    </span>
  )
}

interface SmartListTabProps {
  readonly item: SmartListItem
  readonly active: boolean
  readonly sortable: boolean
  readonly onSelect: (id: string) => void
}

export function SmartListTab({ item, active, sortable, onSelect }: Readonly<SmartListTabProps>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !sortable,
  })

  const tab = (
    <button
      ref={setNodeRef}
      type="button"
      aria-current={active || undefined}
      onClick={() => onSelect(item.id)}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'group relative inline-flex h-12 shrink-0 items-center gap-2 whitespace-nowrap px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        active ? 'font-bold text-foreground' : 'font-medium text-muted-foreground hover:text-body',
        active &&
          'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-foreground',
        sortable && !isDragging && 'hover:cursor-grab',
        isDragging && 'opacity-30 after:hidden',
      )}
      {...attributes}
      {...listeners}
    >
      {sortable && (
        <GripVertical
          aria-hidden
          className="-ml-1.5 -mr-0.5 size-3.5 shrink-0 text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        />
      )}
      {item.label}
      {item.count !== undefined && (
        <span
          className={cn(
            'inline-flex h-5.5 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-semibold tabular-nums',
            active ? 'bg-primary-pale text-primary-deep' : 'bg-muted text-muted-foreground',
          )}
        >
          {item.count}
        </span>
      )}
    </button>
  )

  if (!item.description) return tab

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>{tab}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-44 px-2.5 py-1.5">
        <p className="text-xs font-medium">{item.label}</p>
        <p className="text-xs leading-snug opacity-70">{item.description}</p>
      </TooltipContent>
    </Tooltip>
  )
}
