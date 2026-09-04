'use client'

import { useState } from 'react'

import { cn } from '@/shared/lib'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { GROOVY_ITEM, GROOVY_ITEM_IDLE } from '@/shared/ui/molecules/groovy-popover/constants'

import type { MouseEvent, ReactNode } from 'react'

export type ActionMenuItem = {
  readonly id: string
  readonly label: string
  readonly icon?: ReactNode
  readonly tone?: 'default' | 'danger'
  readonly onClick?: () => void
  readonly href?: string
  readonly external?: boolean
}

type ActionMenuProps = {
  readonly items: ReadonlyArray<ActionMenuItem>
  readonly children: ReactNode
  readonly align?: 'start' | 'center' | 'end'
  readonly className?: string
}

const ITEM_CLASSES = (tone?: 'default' | 'danger') =>
  cn(
    GROOVY_ITEM,
    GROOVY_ITEM_IDLE,
    tone === 'danger' && 'hover:bg-destructive/10 hover:text-destructive',
  )

function stop(event: MouseEvent) {
  event.stopPropagation()
}

export function ActionMenu({
  items,
  children,
  align = 'end',
  className,
}: Readonly<ActionMenuProps>) {
  const [open, setOpen] = useState(false)

  return (
    <GroovyPopover open={open} onOpenChange={setOpen}>
      <GroovyPopover.Trigger asChild>{children}</GroovyPopover.Trigger>
      <GroovyPopover.Content align={align} className={cn('w-44', className)}>
        {items.map((item) =>
          item.href !== undefined ? (
            <a
              key={item.id}
              href={item.href}
              role="menuitem"
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer noopener' : undefined}
              onClick={(event) => {
                stop(event)
                setOpen(false)
              }}
              className={ITEM_CLASSES(item.tone)}
            >
              {item.icon && (
                <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
                  {item.icon}
                </span>
              )}
              <span className="flex-1 truncate">{item.label}</span>
            </a>
          ) : (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={(event) => {
                stop(event)
                setOpen(false)
                item.onClick?.()
              }}
              className={ITEM_CLASSES(item.tone)}
            >
              {item.icon && (
                <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
                  {item.icon}
                </span>
              )}
              <span className="flex-1 truncate">{item.label}</span>
            </button>
          ),
        )}
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
