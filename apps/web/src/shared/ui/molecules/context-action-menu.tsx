'use client'

import { cn } from '@/shared/lib'
import {
  GROOVY_ITEM,
  GROOVY_ITEM_IDLE,
  GROOVY_SURFACE,
} from '@/shared/ui/molecules/groovy-popover/constants'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/shared/ui/shadcn/context-menu'

import type { ActionMenuItem } from '@/shared/ui/molecules/action-menu'
import type { MouseEvent, ReactNode } from 'react'

type ContextActionMenuProps = {
  readonly items: ReadonlyArray<ActionMenuItem>
  readonly children: ReactNode
  readonly onContextMenu?: (event: MouseEvent<HTMLElement>) => void
}

function itemClasses(tone?: ActionMenuItem['tone']) {
  return cn(
    GROOVY_ITEM,
    GROOVY_ITEM_IDLE,
    'cursor-pointer focus:bg-accent focus:text-accent-foreground',
    tone === 'danger' &&
      'hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive',
  )
}

function ItemBody({ item }: Readonly<{ item: ActionMenuItem }>) {
  return (
    <>
      {item.icon && (
        <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
          {item.icon}
        </span>
      )}
      <span className="flex-1 truncate">{item.label}</span>
    </>
  )
}

export function ContextActionMenu({
  items,
  children,
  onContextMenu,
}: Readonly<ContextActionMenuProps>) {
  if (items.length === 0 && !onContextMenu) return <>{children}</>

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild onContextMenu={onContextMenu}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className={cn(GROOVY_SURFACE, 'w-44')}>
        {items.map((item) =>
          item.href !== undefined ? (
            <ContextMenuItem key={item.id} asChild className={itemClasses(item.tone)}>
              <a
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer noopener' : undefined}
              >
                <ItemBody item={item} />
              </a>
            </ContextMenuItem>
          ) : (
            <ContextMenuItem
              key={item.id}
              onSelect={() => item.onClick?.()}
              className={itemClasses(item.tone)}
            >
              <ItemBody item={item} />
            </ContextMenuItem>
          ),
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
