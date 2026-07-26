import { useTranslation } from 'react-i18next'

import { ArcColorPicker } from '@/shared/ui/molecules/color-picker'
import { Label } from '@/shared/ui/shadcn/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover'

import type { OverridableColorKey } from '../../model/appearance.types'
import type { ThemeColors } from '@repo/shared-types'

const OVERRIDE_ITEMS: ReadonlyArray<{ key: OverridableColorKey; label: string }> = [
  { key: 'accent', label: 'Accent' },
  { key: 'sidebar', label: 'Sidebar' },
  { key: 'secondary', label: 'Background' },
  { key: 'sidebarForeground', label: 'Text' },
]

interface ThemeColorsSectionProps {
  readonly colors: ThemeColors
  readonly onColorOverride: (key: OverridableColorKey, v: string) => void
}

export function ThemeColorsSection({ colors, onColorOverride }: ThemeColorsSectionProps) {
  const { t } = useTranslation()

  return (
    <div className="mb-6">
      <Label className="text-xs text-muted-foreground">
        {t('onboarding.steps.appearance.secondaryColors', 'Theme colors')}
      </Label>
      <div className="mt-2 flex flex-wrap gap-3">
        {OVERRIDE_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="size-7 rounded-full border-2 border-border transition-transform duration-150 hover:scale-105"
                  style={{ background: colors[item.key] }}
                  aria-label={`Change ${item.label} color`}
                />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 p-0">
                <ArcColorPicker
                  selectedColor={colors[item.key]}
                  onColorChange={(v) => onColorOverride(item.key, v)}
                  grainIntensity={0}
                  onGrainIntensityChange={() => undefined}
                  className="w-full border-0 shadow-none"
                />
              </PopoverContent>
            </Popover>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
