import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

export function optionTileClass(selected: boolean, className?: string): string {
  return cn(
    'rounded-lg border transition-colors',
    selected
      ? 'border-primary bg-accent text-foreground'
      : 'border-border text-muted-foreground hover:border-primary/50',
    className,
  )
}

interface OptionTileProps {
  readonly selected: boolean
  readonly onSelect: () => void
  readonly children: ReactNode
  readonly className?: string
}

export function OptionTile({ selected, onSelect, children, className }: Readonly<OptionTileProps>) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={optionTileClass(selected, className)}
    >
      {children}
    </button>
  )
}
