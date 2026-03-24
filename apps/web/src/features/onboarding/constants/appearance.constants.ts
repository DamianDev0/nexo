import type { ThemeTypography } from '@repo/shared-types'

export const COLOR_NAMES: Record<string, string> = {
  '#4F46E5': 'Indigo',
  '#7C3AED': 'Violet',
  '#DB2777': 'Pink',
  '#DC2626': 'Red',
  '#EA580C': 'Orange',
  '#D97706': 'Amber',
  '#059669': 'Emerald',
  '#0891B2': 'Cyan',
  '#1D4ED8': 'Blue',
  '#0F172A': 'Slate',
}

export const GOOGLE_FONT_MAP: Record<string, string> = {
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
  label: string
  preview: string
}> = [
  { value: 'none', label: 'Sharp', preview: 'rounded-none' },
  { value: 'sm', label: 'Subtle', preview: 'rounded-sm' },
  { value: 'md', label: 'Medium', preview: 'rounded-md' },
  { value: 'lg', label: 'Rounded', preview: 'rounded-lg' },
  { value: 'full', label: 'Pill', preview: 'rounded-full' },
]

export const DENSITY_OPTIONS: ReadonlyArray<{
  value: ThemeTypography['density']
  label: string
}> = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
]

export const RADIUS_MAP: Record<string, string> = {
  none: '0px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  full: '9999px',
}

export const DENSITY_MAP: Record<string, { px: string; py: string; gap: string }> = {
  compact: { px: '8px', py: '4px', gap: '4px' },
  comfortable: { px: '12px', py: '6px', gap: '8px' },
  spacious: { px: '16px', py: '10px', gap: '12px' },
}
