import { BRAND_COLOR_OPTIONS } from '@repo/shared-utils'

import type { ThemePreset } from './appearance.constants'
import type { ColorOverrides, ThemeMode } from './appearance.types'
import type { ThemeTypography } from '@repo/shared-types'

export interface AppearanceFormValues {
  primaryColor: string
  colorOverrides: ColorOverrides
  grainIntensity: number
  darkMode: ThemeMode
  fontFamily: ThemeTypography['fontFamily']
  borderRadius: ThemeTypography['borderRadius']
  density: ThemeTypography['density']
  productName: string
  tagline: string
  logoUrl: string | null
  logoPreview: string | null
  logoFileName: string | null
}

export const APPEARANCE_DEFAULT_VALUES: AppearanceFormValues = {
  primaryColor: BRAND_COLOR_OPTIONS[0].hex,
  colorOverrides: {},
  grainIntensity: 0,
  darkMode: 'system',
  fontFamily: 'inter',
  borderRadius: 'lg',
  density: 'comfortable',
  productName: '',
  tagline: '',
  logoUrl: null,
  logoPreview: null,
  logoFileName: null,
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
