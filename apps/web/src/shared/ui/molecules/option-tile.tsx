import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

interface OptionTileProps {
  readonly selected: boolean
  readonly onSelect: () => void
  readonly children: ReactNode
  readonly className?: string
}

export function OptionTile({ selected, onSelect, children, className }: OptionTileProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'rounded-lg border transition-colors',
        selected
          ? 'border-primary bg-accent text-foreground'
          : 'border-border text-muted-foreground hover:border-primary/50',
        className,
      )}
    >
      {children}
    </button>
  )
}
