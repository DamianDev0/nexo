'use client'

import { cn } from '@/shared/lib'
import { DotsThreeVerticalIcon } from '@/shared/ui/icons'
import { ActionMenu } from '@/shared/ui/molecules/action-menu'

import type { SmartListItem, SmartListMenuAction } from '../model/smart-list.types'

type SmartListTabMenuProps = {
  readonly item: SmartListItem
  readonly actions: ReadonlyArray<SmartListMenuAction>
  readonly label?: string
}

export function SmartListTabMenu({ item, actions, label }: Readonly<SmartListTabMenuProps>) {
  const menuItems = actions.map((action) => {
    const Icon = action.icon
    return {
      id: action.key,
      label: action.label,
      tone: action.tone,
      icon: Icon ? <Icon /> : undefined,
      onClick: action.onSelect,
    }
  })

  return (
    <ActionMenu items={menuItems} align="start">
      <button
        type="button"
        aria-haspopup="menu"
        aria-label={label ? `${label}: ${item.label}` : item.label}
        className={cn(
          'absolute top-1/2 right-1 z-10 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none transition-[opacity,background-color,color] duration-200 hover:bg-muted hover:text-foreground focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50',
          'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100',
          'data-[state=open]:pointer-events-auto data-[state=open]:bg-muted data-[state=open]:text-foreground data-[state=open]:opacity-100',
        )}
      >
        <DotsThreeVerticalIcon aria-hidden className="size-3.5" />
      </button>
    </ActionMenu>
  )
}
