'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'motion/react'
import { memo } from 'react'

import { cn } from '@/shared/lib'
import { DotsSixVerticalIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { Button } from '@/shared/ui/shadcn/button'

import { SmartListTabMenu } from './smart-list-tab-menu'

import type { SmartListItem, SmartListMenuAction } from '../model/smart-list.types'
import type { KeyboardEvent } from 'react'

export function SmartListTabGhost({ item }: Readonly<{ item: SmartListItem }>) {
  return (
    <motion.span
      initial={{ scale: 0.94, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 700, damping: 40 }}
      className="inline-flex h-10 rotate-1 cursor-grabbing items-center gap-2 whitespace-nowrap rounded-md border border-border bg-card px-3.5 text-sm font-medium text-foreground shadow-e3"
    >
      <DotsSixVerticalIcon className="-ml-1 size-3.5 text-primary" />
      {item.label}
      {item.count !== undefined && (
        <span className="inline-flex h-5.5 min-w-6 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-medium tabular-nums text-muted-foreground">
          {item.count}
        </span>
      )}
    </motion.span>
  )
}

interface SmartListTabActions {
  readonly onSelect: (id: string) => void
  readonly onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  readonly itemMenu?: (item: SmartListItem) => ReadonlyArray<SmartListMenuAction>
  readonly menuLabel?: string
}

interface SmartListTabProps {
  readonly item: SmartListItem
  readonly active: boolean
  readonly sortable: boolean
  readonly hotkey?: number
  readonly actions: SmartListTabActions
}

function SmartListTabBase({
  item,
  active,
  sortable,
  hotkey,
  actions,
}: Readonly<SmartListTabProps>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !sortable })

  const menuActions = actions.itemMenu?.(item) ?? []
  const hasMenu = menuActions.length > 0

  const trigger = (
    <Button
      variant="ghost"
      aria-pressed={active}
      tabIndex={active ? 0 : -1}
      onClick={() => actions.onSelect(item.id)}
      onKeyDown={actions.onKeyDown}
      className={cn(
        'relative h-12 gap-2 whitespace-nowrap rounded-none px-4 text-sm hover:bg-transparent',
        sortable && 'pl-7 pr-5',
        hasMenu && 'pr-8',
        active
          ? 'font-semibold text-foreground'
          : 'font-normal text-muted-foreground hover:text-body',
      )}
    >
      {active && !isDragging && (
        <motion.span
          layoutId="smart-list-underline"
          className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary"
          transition={{ type: 'spring', stiffness: 550, damping: 45 }}
        />
      )}
      {item.icon ? <item.icon className="size-3.5 shrink-0 text-primary-deep" /> : null}
      {item.label}
      {item.count !== undefined && (
        <span
          className={cn(
            'inline-flex h-5.5 min-w-6 items-center justify-center overflow-hidden rounded-md px-1.5 text-xs font-medium tabular-nums',
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
    </Button>
  )

  return (
    <span
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      data-tab-id={item.id}
      data-pinned={item.pinned === true}
      className={cn(
        'group relative inline-flex shrink-0 items-center',
        'before:absolute before:left-0 before:top-1/2 before:h-5 before:w-px before:-translate-y-1/2 before:bg-border first:before:hidden',
        item.pinned && 'sticky left-0 z-20 bg-card',
        isDragging && 'opacity-30',
      )}
    >
      {sortable && (
        <span
          ref={setActivatorNodeRef}
          aria-label={item.label}
          className={cn(
            'absolute left-0.5 z-10 inline-flex h-8 w-6 touch-none items-center justify-center rounded-sm text-primary outline-none transition-[opacity,transform] duration-200 ease-out focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50',
            isDragging
              ? 'cursor-grabbing opacity-100'
              : '-translate-x-1 cursor-grab opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100',
          )}
          {...attributes}
          {...listeners}
        >
          <DotsSixVerticalIcon aria-hidden className="size-3.5" />
        </span>
      )}
      {hasMenu && <SmartListTabMenu item={item} actions={menuActions} label={actions.menuLabel} />}
      {item.description ? (
        <HintTooltip
          asChild
          side="bottom"
          delayDuration={500}
          hint={
            <>
              <span className="flex items-center justify-between gap-3 font-medium">
                {item.label}
                {hotkey !== undefined && (
                  <kbd className="rounded-sm bg-background/20 px-1 font-sans text-[10px] tabular-nums">
                    {hotkey}
                  </kbd>
                )}
              </span>
              <span className="mt-0.5 block opacity-80">{item.description}</span>
            </>
          }
        >
          {trigger}
        </HintTooltip>
      ) : (
        trigger
      )}
    </span>
  )
}

export const SmartListTab = memo(SmartListTabBase)
