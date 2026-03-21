'use client'

import { ArrowDown, ArrowUp, ArrowUpDown, EyeOff } from 'lucide-react'
import type { Column } from '@tanstack/react-table'

import { cn } from '@/utils'
import { Button } from '@/components/atoms/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/organisms/dropdown-menu'

interface DataTableColumnHeaderProps<TData, TValue> {
  readonly column: Column<TData, TValue>
  readonly title: string
  readonly className?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={className}>{title}</span>
  }

  const sorted = column.getIsSorted()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            '-ml-3 h-8 font-medium hover:bg-muted/50 data-[state=open]:bg-muted/50',
            className,
          )}
        >
          {title}
          {sorted === false && <ArrowUpDown className="opacity-50" />}
          {sorted === 'asc' && <ArrowUp />}
          {sorted === 'desc' && <ArrowDown />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
          <ArrowUp className="text-muted-foreground" />
          Ascending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
          <ArrowDown className="text-muted-foreground" />
          Descending
        </DropdownMenuItem>
        {sorted && (
          <DropdownMenuItem onClick={() => column.clearSorting()}>
            <ArrowUpDown className="text-muted-foreground" />
            Clear
          </DropdownMenuItem>
        )}
        {column.getCanHide() && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOff className="text-muted-foreground" />
              Hide column
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
