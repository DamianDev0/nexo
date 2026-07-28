'use client'

import { useTranslation } from 'react-i18next'

import { OptionTile } from '@/shared/ui/molecules/option-tile'
import { Label } from '@/shared/ui/shadcn/label'

import { GOOGLE_FONT_MAP, THEME_PRESETS, type ThemePreset } from '../../model/appearance.constants'
import { derivePalette } from '../../model/palette.utils'

interface PresetsSectionProps {
  readonly activePresetKey: string | null
  readonly onApplyPreset: (preset: ThemePreset) => void
}

function PresetSwatches({ preset }: Readonly<{ preset: ThemePreset }>) {
  const palette = derivePalette(preset.primary, preset.overrides)
  const dots = [
    ['primary', palette.primary],
    ['accent', palette.accent],
    ['sidebar', palette.sidebar],
  ] as const
  return (
    <div className="flex -space-x-1">
      {dots.map(([role, color]) => (
        <span
          key={role}
          className="size-4 rounded-full border border-card"
          style={{ background: color }}
        />
      ))}
    </div>
  )
}

export function PresetsSection({ activePresetKey, onApplyPreset }: Readonly<PresetsSectionProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.appearance.presets'

  return (
    <div className="px-4 py-4">
      <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">
        {t(`${s}.title`)}
      </Label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {THEME_PRESETS.map((preset) => (
          <OptionTile
            key={preset.key}
            selected={activePresetKey === preset.key}
            onSelect={() => onApplyPreset(preset)}
            className="flex flex-col gap-2 p-3 text-left"
          >
            <div className="flex w-full items-center justify-between">
              <PresetSwatches preset={preset} />
              {preset.recommended && (
                <span className="rounded-full bg-primary-pale px-2 py-0.5 text-[10px] font-semibold text-primary-deep dark:text-primary">
                  {t(`${s}.recommended`)}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{t(`${s}.${preset.key}`)}</p>
              <p className="text-[10px] text-muted-foreground">
                {GOOGLE_FONT_MAP[preset.fontFamily]} · {t(`${s}.meta.${preset.borderRadius}`)}
              </p>
            </div>
          </OptionTile>
        ))}
      </div>
    </div>
  )
}
