'use client'

import { cn } from '@/shared/lib'

import type { ReactNode } from 'react'

export interface SegmentedOption<T extends string> {
  readonly value: T
  readonly label: ReactNode
}

interface SegmentedControlProps<T extends string> {
  readonly value: T
  readonly onValueChange: (value: T) => void
  readonly options: ReadonlyArray<SegmentedOption<T>>
  readonly className?: string
}

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  className,
}: Readonly<SegmentedControlProps<T>>) {
  return (
    <div
      role="radiogroup"
      className={cn('flex rounded-lg border border-input bg-muted/40 p-0.5', className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onValueChange(option.value)}
          className={cn(
            'flex min-h-7 flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors',
            value === option.value
              ? 'bg-card font-medium text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
