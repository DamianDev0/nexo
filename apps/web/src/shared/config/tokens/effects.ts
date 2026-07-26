export const AUTH_BG_LIGHT = `
  radial-gradient(ellipse 72% 62% at 14% 82%, rgba(182,154,122,0.92) 0%, transparent 52%),
  radial-gradient(ellipse 62% 58% at 86% 14%, rgba(218,204,182,0.88) 0%, transparent 52%),
  radial-gradient(ellipse 50% 50% at 52% 52%, rgba(200,183,160,0.5) 0%, transparent 58%),
  #c9c0b6
`

export const AUTH_BG_DARK = `
  radial-gradient(ellipse 72% 62% at 14% 82%, rgba(30,25,20,0.9) 0%, transparent 52%),
  radial-gradient(ellipse 62% 58% at 86% 14%, rgba(35,30,25,0.85) 0%, transparent 52%),
  radial-gradient(ellipse 50% 50% at 52% 52%, rgba(25,20,15,0.5) 0%, transparent 58%),
  #0a0a0a
`

export const PANEL_GLOW_LIGHT =
  'radial-gradient(ellipse 100% 70% at 50% 50%, rgba(255,220,170,0.25) 0%, transparent 70%)'

export const PANEL_GLOW_DARK =
  'radial-gradient(ellipse 100% 70% at 50% 50%, rgba(200,140,60,0.06) 0%, transparent 70%)'

export const ORB_GRADIENT =
  'radial-gradient(circle at 36% 32%, #ffc870 0%, #e98520 36%, #c85c10 65%, #9e3a08 84%, #7a2a05 100%)'

export const ORB_SHADOW =
  '0 28px 72px rgba(165,68,10,0.42), 0 8px 28px rgba(208,98,18,0.22), inset 0 -14px 38px rgba(0,0,0,0.22), inset 6px 6px 22px rgba(255,195,90,0.13)'

export const ORB_SPECULAR = 'radial-gradient(ellipse, rgba(255,253,240,0.55) 0%, transparent 80%)'

export const ORB_RIM_LIGHT = 'radial-gradient(ellipse, rgba(255,180,80,0.25) 0%, transparent 80%)'

export const NODE_DOT_STYLE = {
  background: 'radial-gradient(circle at 38% 35%, #fff7e8, #e5c07a 55%, #c49030)',
  boxShadow: '0 2px 14px rgba(200,130,0,0.25), inset 0 1px 3px rgba(255,245,224,0.65)',
  border: '0.5px solid rgba(212,160,48,0.3)',
} as const

export const CONNECTOR_LINE_LIGHT = 'rgba(180,120,30,0.22)'
export const CONNECTOR_LINE_DARK = 'rgba(200,150,60,0.18)'

export const ORB_LABEL_LIGHT = 'rgba(30,21,8,0.45)'
export const ORB_LABEL_DARK = 'rgba(255,245,224,0.45)'

export const ORB_GRID_LIGHT = '#a09070'
export const ORB_GRID_DARK = '#c9b97a'

export const ORB_LINK_STROKE = 'rgba(212,160,48,0.35)'

export const NODE_GRADIENT_STOPS = [
  { offset: '0%', color: '#fff7e8' },
  { offset: '55%', color: '#e5c07a' },
  { offset: '100%', color: '#c49030' },
] as const

export const ONBOARDING_GLOW_LIGHT =
  'radial-gradient(circle, rgba(200,92,16,0.06) 0%, transparent 70%)'
export const ONBOARDING_GLOW_DARK =
  'radial-gradient(circle, rgba(233,133,32,0.08) 0%, transparent 70%)'

export const TOAST_FILL_LIGHT = '#FFFFFF'
export const TOAST_FILL_DARK = '#171717'

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
