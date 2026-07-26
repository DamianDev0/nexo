import { BRAND_COLOR_OPTIONS } from '@repo/shared-utils'
import { Paintbrush } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { ArcColorPicker } from '@/shared/ui/molecules/color-picker'
import { Label } from '@/shared/ui/shadcn/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover'

import { COLOR_NAMES } from '../../model/appearance.constants'

interface BrandColorSectionProps {
  readonly primaryColor: string
  readonly grainIntensity: number
  readonly onPrimaryColorChange: (v: string) => void
  readonly onGrainIntensityChange: (v: number) => void
}

export function BrandColorSection({
  primaryColor,
  grainIntensity,
  onPrimaryColorChange,
  onGrainIntensityChange,
}: BrandColorSectionProps) {
  const { t } = useTranslation()
  const colorName = COLOR_NAMES[primaryColor.toUpperCase()] ?? 'Custom'

  return (
    <div className="mb-6">
      <Label className="text-xs text-muted-foreground">
        {t('onboarding.steps.appearance.primaryColor')}
      </Label>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {BRAND_COLOR_OPTIONS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onPrimaryColorChange(color)}
            className={cn(
              'size-7 rounded-full border-2 transition-transform duration-150',
              primaryColor === color
                ? 'scale-110 border-foreground'
                : 'border-transparent hover:scale-105',
            )}
            style={{ background: color }}
            aria-label={`Select ${COLOR_NAMES[color] ?? color}`}
            aria-pressed={primaryColor === color}
          />
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-full border-2 border-border transition-transform duration-150 hover:scale-105 hover:border-foreground/50"
              aria-label="Pick custom color"
            >
              <Paintbrush className="size-3 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-0">
            <ArcColorPicker
              selectedColor={primaryColor}
              onColorChange={onPrimaryColorChange}
              grainIntensity={grainIntensity}
              onGrainIntensityChange={onGrainIntensityChange}
              className="w-full border-0 shadow-none"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <div className="size-3 rounded-sm" style={{ background: primaryColor }} />
        <span className="text-xs text-muted-foreground">
          {colorName} · <span className="font-mono text-xs">{primaryColor}</span>
        </span>
      </div>
    </div>
  )
}
