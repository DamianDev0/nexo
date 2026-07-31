'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { motion } from 'motion/react'

import { cn } from '@/shared/lib'
import { escapeHtml } from '@/shared/lib/escape-html'

import type { SmartListItem } from './smart-lists'

function tabTooltipHtml(item: SmartListItem, hotkey: number | undefined): string {
  const title = `<b>${escapeHtml(item.label)}</b>${hotkey === undefined ? '' : ` <kbd>${hotkey}</kbd>`}`
  return `${title}<br>${escapeHtml(item.description ?? '')}`
}

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
  readonly hotkey?: number
  readonly onSelect: (id: string) => void
}

export function SmartListTab({
  item,
  active,
  sortable,
  hotkey,
  onSelect,
}: Readonly<SmartListTabProps>) {
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
        sortable && !isDragging && 'hover:cursor-grab',
        isDragging && 'opacity-30',
      )}
      {...attributes}
      {...listeners}
    >
      {active && !isDragging && (
        <motion.span
          layoutId="smart-list-underline"
          className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-foreground"
          transition={{ type: 'spring', stiffness: 550, damping: 45 }}
        />
      )}
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
            'inline-flex h-5.5 min-w-6 items-center justify-center overflow-hidden rounded-md px-1.5 text-xs font-semibold tabular-nums',
            active ? 'bg-primary-pale text-primary-deep' : 'bg-muted text-muted-foreground',
          )}
        >
          <motion.span
            key={item.count}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 30 }}
          >
            {item.count}
          </motion.span>
        </span>
      )}
    </button>
  )

  if (!item.description) return tab

  return (
    <vs-tooltip content={tabTooltipHtml(item, hotkey)} placement="bottom" delay="450">
      {tab}
    </vs-tooltip>
  )
}
