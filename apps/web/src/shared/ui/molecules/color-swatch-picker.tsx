'use client'

import { useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover'

interface ColorSwatchPickerProps {
  readonly color: string
  readonly colors: ReadonlyArray<string>
  readonly onChange: (color: string) => void
  readonly label: string
}

export function ColorSwatchPicker({
  color,
  colors,
  onChange,
  label,
}: Readonly<ColorSwatchPickerProps>) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted"
        >
          <ColorDot color={color} className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-xl p-3">
        <div className="grid grid-cols-10 gap-2">
          {colors.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={swatch}
              aria-pressed={swatch === color}
              className={cn(
                'size-6 rounded-full transition-transform hover:scale-110',
                swatch === color && 'border-2 border-white shadow-lg dark:border-white/80',
              )}
              style={{ background: swatch }}
              onClick={() => {
                onChange(swatch)
                setOpen(false)
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
