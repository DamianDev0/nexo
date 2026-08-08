'use client'

import { ColorSwatchPicker } from '@/shared/ui/molecules/color-swatch-picker'
import { Input } from '@/shared/ui/shadcn/input'

import type { ReactNode } from 'react'

interface EditableSwatchRowProps {
  readonly swatch: {
    readonly color: string
    readonly colors: ReadonlyArray<string>
    readonly onChange: (color: string) => void
    readonly label: string
  }
  readonly name: {
    readonly value: string
    readonly placeholder?: string
    readonly onChange: (value: string) => void
    readonly onBlur?: () => void
  }
  readonly leading?: ReactNode
  readonly trailing?: ReactNode
}

export function EditableSwatchRow({
  swatch,
  name,
  leading,
  trailing,
}: Readonly<EditableSwatchRowProps>) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
      {leading}
      <ColorSwatchPicker
        color={swatch.color}
        colors={swatch.colors}
        onChange={swatch.onChange}
        label={swatch.label}
      />
      <Input
        className="h-8 flex-1 border-transparent bg-transparent text-sm shadow-none focus-visible:border-border"
        value={name.value}
        placeholder={name.placeholder}
        onChange={(e) => name.onChange(e.target.value)}
        onBlur={name.onBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
      />
      {trailing}
    </div>
  )
}
