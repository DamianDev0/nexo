import { BRAND_COLOR_OPTIONS } from '@repo/shared-utils'
import { Paintbrush } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { ArcColorPicker } from '@/shared/ui/molecules/color-picker'
import { Button } from '@/shared/ui/shadcn/button'
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
}: Readonly<BrandColorSectionProps>) {
  const { t } = useTranslation()
  const colorName = COLOR_NAMES[primaryColor.toUpperCase()] ?? 'Custom'

  return (
    <div className="px-4 py-4">
      <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">
        {t('onboarding.steps.appearance.primaryColor')}
      </Label>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {BRAND_COLOR_OPTIONS.map(({ hex, label }) => (
          <button
            key={hex}
            type="button"
            onClick={() => onPrimaryColorChange(hex)}
            className={cn(
              'size-7 rounded-full border-2 transition-transform duration-150',
              primaryColor === hex
                ? 'scale-110 border-foreground'
                : 'border-transparent hover:scale-105',
            )}
            style={{ background: hex }}
            aria-label={`Select ${label}`}
            aria-pressed={primaryColor === hex}
          />
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{colorName}</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              aria-label={t('onboarding.steps.appearance.customColor')}
              className="h-8 w-32 justify-start gap-2 px-2 font-normal"
            >
              <span
                className="size-4.5 shrink-0 rounded-sm border border-border/60"
                style={{ background: primaryColor }}
              />
              <span className="font-mono text-xs uppercase text-foreground/80">{primaryColor}</span>
              <Paintbrush className="ml-auto size-3 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-0">
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
    </div>
  )
}
