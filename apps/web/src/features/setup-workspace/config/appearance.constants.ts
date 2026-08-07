import { BRAND_COLOR_OPTIONS, NEXO_BRAND_PALETTE } from '@repo/shared-utils'

import type { AppearanceFormValues, ThemePreset } from '../model/types'
import type { ThemeTypography } from '@repo/shared-types'

export const COLOR_NAMES: Record<string, string> = Object.fromEntries(
  BRAND_COLOR_OPTIONS.map(({ hex, label }) => [hex, label]),
)

export const GOOGLE_FONT_MAP: Record<ThemeTypography['fontFamily'], string> = {
  inter: 'Inter',
  roboto: 'Roboto',
  poppins: 'Poppins',
  nunito: 'Nunito',
  system: 'system-ui',
}

export const FONT_OPTIONS: ReadonlyArray<{
  value: ThemeTypography['fontFamily']
  label: string
  sample: string
}> = [
  { value: 'inter', label: 'Inter', sample: 'Aa' },
  { value: 'roboto', label: 'Roboto', sample: 'Aa' },
  { value: 'poppins', label: 'Poppins', sample: 'Aa' },
  { value: 'nunito', label: 'Nunito', sample: 'Aa' },
  { value: 'system', label: 'System', sample: 'Aa' },
]

export const RADIUS_OPTIONS: ReadonlyArray<{
  value: ThemeTypography['borderRadius']
  labelKey: string
  preview: string
}> = [
  { value: 'none', labelKey: 'sharp', preview: 'rounded-tl-none' },
  { value: 'sm', labelKey: 'subtle', preview: 'rounded-tl-sm' },
  { value: 'md', labelKey: 'medium', preview: 'rounded-tl-md' },
  { value: 'lg', labelKey: 'rounded', preview: 'rounded-tl-lg' },
  { value: 'full', labelKey: 'pill', preview: 'rounded-tl-full' },
]

export const DENSITY_OPTIONS: ReadonlyArray<{
  value: ThemeTypography['density']
  labelKey: string
}> = [
  { value: 'compact', labelKey: 'compact' },
  { value: 'comfortable', labelKey: 'comfortable' },
  { value: 'spacious', labelKey: 'spacious' },
]

function brandHex(label: string): string {
  return BRAND_COLOR_OPTIONS.find((o) => o.label === label)?.hex ?? BRAND_COLOR_OPTIONS[0].hex
}

const VIOLET = brandHex('Violet')
const EMERALD = brandHex('Emerald')
const SLATE = brandHex('Slate')

export const NEXO_PRESET: ThemePreset = {
  key: 'nexo',
  primary: NEXO_BRAND_PALETTE.primary,
  overrides: {
    accent: NEXO_BRAND_PALETTE.accent,
    secondary: NEXO_BRAND_PALETTE.secondary,
    sidebar: NEXO_BRAND_PALETTE.sidebar,
    sidebarForeground: NEXO_BRAND_PALETTE.sidebarForeground,
  },
  fontFamily: 'inter',
  borderRadius: 'sm',
  density: 'comfortable',
  darkMode: 'system',
  recommended: true,
}

export const THEME_PRESETS: ReadonlyArray<ThemePreset> = [
  NEXO_PRESET,
  {
    key: 'midnight',
    primary: VIOLET,
    overrides: { sidebar: SLATE },
    fontFamily: 'poppins',
    borderRadius: 'lg',
    density: 'comfortable',
    darkMode: 'dark',
  },
  {
    key: 'forest',
    primary: EMERALD,
    overrides: {},
    fontFamily: 'nunito',
    borderRadius: 'full',
    density: 'spacious',
    darkMode: 'light',
  },
  {
    key: 'carbon',
    primary: SLATE,
    overrides: {},
    fontFamily: 'system',
    borderRadius: 'sm',
    density: 'compact',
    darkMode: 'light',
  },
]

export const RADIUS_MAP: Record<ThemeTypography['borderRadius'], string> = {
  none: '0px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  full: '9999px',
}

export const SURFACE_RADIUS_MAP: Record<ThemeTypography['borderRadius'], string> = {
  none: '0px',
  sm: '4px',
  md: '6px',
  lg: '10px',
  full: '16px',
}

export const DENSITY_MAP: Record<
  ThemeTypography['density'],
  { px: string; py: string; gap: string }
> = {
  compact: { px: '8px', py: '4px', gap: '4px' },
  comfortable: { px: '12px', py: '6px', gap: '8px' },
  spacious: { px: '16px', py: '10px', gap: '12px' },
}

export const APPEARANCE_DEFAULT_VALUES: AppearanceFormValues = {
  primaryColor: NEXO_PRESET.primary,
  colorOverrides: NEXO_PRESET.overrides,
  grainIntensity: 0,
  darkMode: NEXO_PRESET.darkMode,
  fontFamily: NEXO_PRESET.fontFamily,
  borderRadius: NEXO_PRESET.borderRadius,
  density: NEXO_PRESET.density,
  productName: '',
  tagline: '',
  logoUrl: null,
  logoPreview: null,
  logoFileName: null,
}
