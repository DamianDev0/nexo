'use client'

import { Search, X } from 'lucide-react'

import { Input } from '@/components/atoms/input'
import { Button } from '@/components/atoms/button'

interface DataTableToolbarProps {
  readonly searchable?: boolean
  readonly searchValue?: string
  readonly onSearchChange?: (value: string) => void
  readonly searchPlaceholder?: string
  readonly children?: React.ReactNode
}

export function DataTableToolbar({
  searchable,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
}: DataTableToolbarProps) {
  const hasSearch = searchable && onSearchChange

  if (!hasSearch && !children) return null

  return (
    <div className="flex items-center justify-between gap-3 py-4">
      <div className="flex flex-1 items-center gap-3">
        {hasSearch && (
          <div className="relative w-full sm:w-70">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 pl-9"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="absolute right-1.5 top-1/2 -translate-y-1/2"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                <X />
              </Button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
