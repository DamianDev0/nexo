'use client'

import { cn } from '@/shared/lib/cn'

import { GROOVY_ITEM, GROOVY_ITEM_ACTIVE, GROOVY_ITEM_IDLE } from './constants'

import type { AppIcon } from '@/shared/ui/icons'
import type { ReactNode } from 'react'

interface GroovyItemContent {
  readonly label: string
  readonly icon?: AppIcon
  readonly shortcut?: ReadonlyArray<string>
  readonly trailing?: ReactNode
}

interface GroovyItemProps {
  readonly content: GroovyItemContent
  readonly active?: boolean
  readonly onSelect?: () => void
}

export function GroovyItem({ content, active = false, onSelect }: Readonly<GroovyItemProps>) {
  const { label, icon: Icon, shortcut, trailing } = content
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={cn(GROOVY_ITEM, active ? GROOVY_ITEM_ACTIVE : GROOVY_ITEM_IDLE)}
    >
      {Icon && (
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
            active
              ? 'bg-primary-pale text-primary-deep dark:text-primary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="size-4" />
        </span>
      )}

      <span className="flex-1 truncate">{label}</span>

      {shortcut && (
        <span className="flex shrink-0 items-center gap-1">
          {shortcut.map((key) => (
            <kbd
              key={key}
              className={cn(
                'flex size-6 items-center justify-center rounded-md text-xs font-medium transition-colors duration-200',
                active
                  ? 'bg-popover text-foreground ring-1 ring-border'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {key}
            </kbd>
          ))}
        </span>
      )}

      {trailing}
    </button>
  )
}
