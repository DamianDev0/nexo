'use client'

import { cn } from '@/shared/lib/cn'
import { ColorSwatchPicker } from '@/shared/ui/molecules/color-swatch-picker'

import type { ReactNode } from 'react'

interface SwatchRowProps {
  readonly swatch: {
    readonly color: string
    readonly colors: ReadonlyArray<string>
    readonly onChange: (color: string) => void
    readonly label: string
  }
  readonly name: ReactNode
  readonly leading?: ReactNode
  readonly trailing?: ReactNode
  readonly ghost?: boolean
}

export function SwatchRow({ swatch, name, leading, trailing, ghost }: Readonly<SwatchRowProps>) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 transition-[box-shadow,border-color,background-color]',
        ghost
          ? 'scale-[1.02] cursor-grabbing shadow-xl ring-1 ring-primary/40'
          : 'hover:border-input/70 hover:bg-row-hover hover:shadow-xs',
      )}
    >
      {leading}
      <ColorSwatchPicker
        color={swatch.color}
        colors={swatch.colors}
        onChange={swatch.onChange}
        label={swatch.label}
      />
      {name}
      {trailing}
    </div>
  )
}
