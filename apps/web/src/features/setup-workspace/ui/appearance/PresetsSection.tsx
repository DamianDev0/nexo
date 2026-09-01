'use client'

import { useTranslation } from 'react-i18next'

import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { Text } from '@/shared/ui/atoms/text'
import { TileRadioGroup } from '@/shared/ui/molecules/tile-radio-group'

import { GOOGLE_FONT_MAP, THEME_PRESETS } from '../../config/appearance.constants'
import { findPresetByKey } from '../../lib/appearance'
import { derivePalette } from '../../lib/palette'

import type { ThemePreset } from '../../model/types'

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

function PresetTile({ preset }: Readonly<{ preset: ThemePreset }>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.appearance.presets'
  return (
    <>
      <div className="flex w-full items-center justify-between">
        <PresetSwatches preset={preset} />
        {preset.recommended && (
          <span className="rounded-full bg-primary-pale px-2 py-0.5 text-[10px] font-semibold text-primary-deep dark:text-primary">
            {t(`${s}.recommended`)}
          </span>
        )}
      </div>
      <div>
        <Text as="p" variant="emphasis">
          {t(`${s}.${preset.key}`)}
        </Text>
        <Text as="p" variant="micro">
          {GOOGLE_FONT_MAP[preset.fontFamily]} · {t(`${s}.meta.${preset.borderRadius}`)}
        </Text>
      </div>
    </>
  )
}

export function PresetsSection({ activePresetKey, onApplyPreset }: Readonly<PresetsSectionProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.appearance.presets'

  const options = THEME_PRESETS.map((preset) => ({
    value: preset.key,
    content: <PresetTile preset={preset} />,
  }))

  const handleChange = (key: string) => {
    const preset = findPresetByKey(key)
    if (preset) onApplyPreset(preset)
  }

  return (
    <div className="px-4 py-4">
      <FieldLabel variant="section">{t(`${s}.title`)}</FieldLabel>
      <div className="mt-2">
        <TileRadioGroup
          value={activePresetKey}
          onChange={handleChange}
          options={options}
          label={t(`${s}.title`)}
          classes={{ group: 'grid-cols-2 gap-2', tile: 'flex flex-col gap-2 p-3 text-left' }}
        />
      </div>
    </div>
  )
}
