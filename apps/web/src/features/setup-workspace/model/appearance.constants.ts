import { BRAND_COLOR_OPTIONS } from '@repo/shared-utils'

import type { ColorOverrides, ThemeMode } from './appearance.types'
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

export interface ThemePreset {
  readonly key: string
  readonly primary: string
  readonly overrides: ColorOverrides
  readonly fontFamily: ThemeTypography['fontFamily']
  readonly borderRadius: ThemeTypography['borderRadius']
  readonly density: ThemeTypography['density']
  readonly darkMode: ThemeMode
  readonly recommended?: boolean
}

function brandHex(label: string): string {
  return BRAND_COLOR_OPTIONS.find((o) => o.label === label)?.hex ?? BRAND_COLOR_OPTIONS[0].hex
}

const INDIGO = brandHex('Indigo')
const VIOLET = brandHex('Violet')
const EMERALD = brandHex('Emerald')
const SLATE = brandHex('Slate')

export const THEME_PRESETS: ReadonlyArray<ThemePreset> = [
  {
    key: 'nexo',
    primary: INDIGO,
    overrides: {},
    fontFamily: 'inter',
    borderRadius: 'lg',
    density: 'comfortable',
    darkMode: 'system',
    recommended: true,
  },
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
