export const AUTH_BG_LIGHT = '#E8EBE6'

export const AUTH_BG_DARK = '#0E0F0C'

export const PANEL_GLOW_LIGHT =
  'radial-gradient(ellipse 100% 70% at 50% 50%, rgba(111,203,58,0.10) 0%, transparent 70%)'

export const PANEL_GLOW_DARK =
  'radial-gradient(ellipse 100% 70% at 50% 50%, rgba(165,233,111,0.06) 0%, transparent 70%)'

export const ORB_GRADIENT =
  'radial-gradient(circle at 36% 32%, #EFFFD8 0%, #A5E96F 36%, #6FCB3A 65%, #3F8C1C 84%, #22590F 100%)'

export const ORB_SHADOW =
  '0 28px 72px rgba(45,110,20,0.42), 0 8px 28px rgba(111,203,58,0.22), inset 0 -14px 38px rgba(0,0,0,0.22), inset 6px 6px 22px rgba(230,255,200,0.13)'

export const ORB_SPECULAR = 'radial-gradient(ellipse, rgba(253,255,240,0.55) 0%, transparent 80%)'

export const ORB_RIM_LIGHT = 'radial-gradient(ellipse, rgba(200,255,150,0.25) 0%, transparent 80%)'

export const NODE_DOT_STYLE = {
  background: 'radial-gradient(circle at 38% 35%, #F7FFE8, #C6E97A 55%, #8FC430)',
  boxShadow: '0 2px 14px rgba(120,200,0,0.25), inset 0 1px 3px rgba(245,255,224,0.65)',
  border: '0.5px solid rgba(160,212,48,0.3)',
} as const

export const CONNECTOR_LINE_LIGHT = 'rgba(95,169,43,0.22)'
export const CONNECTOR_LINE_DARK = 'rgba(165,233,111,0.18)'

export const ORB_LABEL_LIGHT = 'rgba(30,33,21,0.45)'
export const ORB_LABEL_DARK = 'rgba(242,244,240,0.45)'

export const ORB_GRID_LIGHT = '#DFE4DB'
export const ORB_GRID_DARK = '#2A2D27'

export const ORB_LINK_STROKE = 'rgba(160,212,48,0.35)'

export const NODE_GRADIENT_STOPS = [
  { offset: '0%', color: '#F7FFE8' },
  { offset: '55%', color: '#C6E97A' },
  { offset: '100%', color: '#8FC430' },
] as const

export const ONBOARDING_GLOW_LIGHT =
  'radial-gradient(circle, rgba(111,203,58,0.10) 0%, transparent 70%)'
export const ONBOARDING_GLOW_DARK =
  'radial-gradient(circle, rgba(165,233,111,0.08) 0%, transparent 70%)'

export const TOAST_FILL_LIGHT = '#FFFFFF'
export const TOAST_FILL_DARK = '#171915'

export const WHITE = '#FFFFFF'

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
