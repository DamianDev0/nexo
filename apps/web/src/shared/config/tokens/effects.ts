export const AUTH_BG_LIGHT = '#E8EBE6'

export const AUTH_BG_DARK = '#0E0F0C'

export const ORB_GLOW_LIGHT =
  'radial-gradient(circle closest-side, rgba(174,240,55,0.5) 0%, rgba(154,230,60,0.22) 45%, transparent 100%)'

export const ORB_GLOW_DARK =
  'radial-gradient(circle closest-side, rgba(165,233,111,0.20) 0%, rgba(165,233,111,0.08) 45%, transparent 100%)'

export const NODE_DOT_STYLE = {
  background: 'radial-gradient(circle at 38% 35%, #F7FFE8, #C6E97A 55%, #8FC430)',
  boxShadow: '0 2px 14px rgba(120,200,0,0.25), inset 0 1px 3px rgba(245,255,224,0.65)',
  border: '0.5px solid rgba(160,212,48,0.3)',
} as const

export const CONNECTOR_LINE_LIGHT = 'rgba(95,169,43,0.22)'
export const ORB_LABEL_LIGHT = 'rgba(30,33,21,0.45)'
export const ORB_GRID_LIGHT = '#DFE4DB'
export const ONBOARDING_GLOW_LIGHT =
  'radial-gradient(circle, rgba(111,203,58,0.10) 0%, transparent 70%)'
export const ONBOARDING_GLOW_DARK =
  'radial-gradient(circle, rgba(165,233,111,0.08) 0%, transparent 70%)'

export const TOAST_FILL_LIGHT = '#FFFFFF'
export const TOAST_FILL_DARK = '#171915'

export const PREVIEW_STATUS_WON = { bg: '#05966920', text: '#059669' } as const
export const PREVIEW_STATUS_LOST = { bg: '#DC262620', text: '#DC2626' } as const
export const PREVIEW_ROW_OVERLAY = '#ffffff05'

export const UPLOAD_ACCENT_SUCCESS = '#22c55e'
export const UPLOAD_ACCENT_ACTIVE = '#3b82f6'

export const SWATCH_PRESETS = [
  { value: 'linear-gradient(45deg, #ff9a9e, #fad0c4)', gradient: true },
  { value: '#6B6E8D' },
  { value: 'linear-gradient(45deg, #ff9a9e, #fad0c4, #ffd1ff)', gradient: true },
  { value: 'linear-gradient(45deg, #f6d365, #fda085)', gradient: true },
  { value: 'linear-gradient(45deg, #84fab0, #8fd3f4)', gradient: true },
  { value: '#79E7D0' },
  { value: '#7AA2F7' },
] as const

export const MESH_BLOOM = {
  base: '#DFF3C6',
  baseDark: '#1E2A16',
  blobA: '#A5E96F',
  blobB: '#7FD6C2',
  blobC: '#F2FFDA',
  dotInk: 'rgba(14,15,12,0.16)',
  dotInkDark: 'rgba(255,255,255,0.12)',
} as const

export const SIRI_ORB = {
  light: { bg: '#DFF3C6', c1: '#6FCB3A', c2: '#5BC4AC', c3: '#A5E96F' },
  dark: { bg: '#1E2A16', c1: '#A5E96F', c2: '#7FD6C2', c3: '#F2FFDA' },
} as const
