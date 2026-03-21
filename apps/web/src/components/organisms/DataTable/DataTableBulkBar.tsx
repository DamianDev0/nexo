'use client'

import { X } from 'lucide-react'

import { Button } from '@/components/atoms/button'
import type { DataTableBulkAction } from './types'

interface DataTableBulkBarProps {
  readonly selectedCount: number
  readonly bulkActions: DataTableBulkAction[]
  readonly onAction: (action: string) => void
  readonly onClearSelection: () => void
}

export function DataTableBulkBar({
  selectedCount,
  bulkActions,
  onAction,
  onClearSelection,
}: DataTableBulkBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2">
      <span className="text-sm font-medium">{selectedCount} selected</span>

      <div className="flex items-center gap-1.5">
        {bulkActions.map((action) => (
          <Button
            key={action.value}
            variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => onAction(action.value)}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onClearSelection}
        className="ml-auto"
        aria-label="Clear selection"
      >
        <X />
      </Button>
    </div>
  )
}
