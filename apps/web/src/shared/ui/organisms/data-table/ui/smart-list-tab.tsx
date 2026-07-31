'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { cn } from '@/shared/lib'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/shadcn/tooltip'

import type { SmartListItem } from './smart-lists'

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
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'relative inline-flex h-12 shrink-0 items-center gap-2 whitespace-nowrap px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        active ? 'font-bold text-foreground' : 'font-medium text-muted-foreground hover:text-body',
        active &&
          'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-foreground',
        sortable && !isDragging && 'hover:cursor-grab',
        isDragging && 'z-10 rounded-lg bg-card shadow-lg cursor-grabbing after:hidden',
      )}
      {...attributes}
      {...listeners}
    >
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
      <TooltipContent side="bottom" className="max-w-56">
        <p className="font-semibold">{item.label}</p>
        <p className="mt-0.5 opacity-80">{item.description}</p>
      </TooltipContent>
    </Tooltip>
  )
}
