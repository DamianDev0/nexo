import { THEME_PRESETS } from '../config/appearance.constants'

import type { AppearanceFormValues, ThemePreset } from '../model/types'
import type { ThemeTypography } from '@repo/shared-types'

export function findPresetByKey(key: string) {
  return THEME_PRESETS.find((preset) => preset.key === key)
}

export function matchingPresetKey(values: {
  primaryColor: string
  fontFamily: ThemeTypography['fontFamily']
  borderRadius: ThemeTypography['borderRadius']
  density: ThemeTypography['density']
}): string | null {
  const match = THEME_PRESETS.find(
    (p) =>
      p.primary === values.primaryColor &&
      p.fontFamily === values.fontFamily &&
      p.borderRadius === values.borderRadius &&
      p.density === values.density,
  )
  return match?.key ?? null
}

export function withPreset(
  current: AppearanceFormValues,
  preset: ThemePreset,
): AppearanceFormValues {
  return {
    ...current,
    primaryColor: preset.primary,
    colorOverrides: preset.overrides,
    fontFamily: preset.fontFamily,
    borderRadius: preset.borderRadius,
    density: preset.density,
    darkMode: preset.darkMode,
  }
}
