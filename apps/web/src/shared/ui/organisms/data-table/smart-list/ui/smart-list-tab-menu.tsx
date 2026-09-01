'use client'

import { useState } from 'react'

import { cn } from '@/shared/lib'
import { DotsThreeVerticalIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { GROOVY_ITEM, GROOVY_ITEM_IDLE } from '@/shared/ui/molecules/groovy-popover/constants'

import type { SmartListItem, SmartListMenuAction } from '../model/smart-list.types'

type SmartListTabMenuProps = {
  readonly item: SmartListItem
  readonly actions: ReadonlyArray<SmartListMenuAction>
  readonly label?: string
}

export function SmartListTabMenu({ item, actions, label }: Readonly<SmartListTabMenuProps>) {
  const [open, setOpen] = useState(false)

  return (
    <GroovyPopover open={open} onOpenChange={setOpen}>
      <GroovyPopover.Trigger asChild>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={label ? `${label}: ${item.label}` : item.label}
          className={cn(
            'absolute top-1/2 right-1 z-10 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none transition-[opacity,background-color,color] duration-200 hover:bg-muted hover:text-foreground focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50',
            open
              ? 'bg-muted text-foreground opacity-100'
              : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100',
          )}
        >
          <DotsThreeVerticalIcon aria-hidden className="size-3.5" />
        </button>
      </GroovyPopover.Trigger>
      <GroovyPopover.Content subtle align="start" className="w-40">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.key}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                action.onSelect()
              }}
              className={cn(
                GROOVY_ITEM,
                GROOVY_ITEM_IDLE,
                action.tone === 'danger' && 'hover:bg-destructive/10 hover:text-destructive',
              )}
            >
              {Icon && <Icon aria-hidden className="size-4 shrink-0" />}
              <span className="flex-1 truncate">{action.label}</span>
            </button>
          )
        })}
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
