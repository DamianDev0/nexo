'use client'

import { MoreVertical } from 'lucide-react'

import { Button } from '@/components/atoms/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/organisms/dropdown-menu'
import type { DataTableAction } from './types'

interface DataTableRowActionsProps<T> {
  readonly item: T
  readonly actions: DataTableAction<T>[]
  readonly onAction: (action: string, item: T) => void
}

export function DataTableRowActions<T>({ item, actions, onAction }: DataTableRowActionsProps<T>) {
  const visibleActions = actions.filter((a) => !a.hidden?.(item))

  if (visibleActions.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => e.stopPropagation()}
          aria-label="Row actions"
        >
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {visibleActions.map((action) => (
          <DropdownMenuItem
            key={action.value}
            disabled={action.disabled?.(item)}
            className={
              action.variant === 'destructive'
                ? 'text-destructive focus:text-destructive'
                : undefined
            }
            onClick={(e) => {
              e.stopPropagation()
              onAction(action.value, item)
            }}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
