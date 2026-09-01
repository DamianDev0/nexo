'use client'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { ArcColorPicker } from '@/shared/ui/molecules/color-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover'

interface ColorFieldProps {
  readonly label: string
  readonly color: string
  readonly onChange: (value: string) => void
}

export function ColorField({ label, color, onChange }: Readonly<ColorFieldProps>) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Text variant="hint">{label}</Text>
      <Popover>
        <PopoverTrigger asChild>
          <PillButton
            variant="outline"
            size="sm"
            aria-label={label}
            className="h-8 w-32 justify-start px-2 font-normal"
          >
            <span
              className="size-4.5 shrink-0 rounded-sm border border-border/60"
              style={{ background: color }}
            />
            <Text variant="mono">{color}</Text>
          </PillButton>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-0">
          <ArcColorPicker
            selectedColor={color}
            onColorChange={onChange}
            grainIntensity={0}
            onGrainIntensityChange={() => undefined}
            className="w-full border-0 shadow-none"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
