function primaryMix(percent: number): string {
  return `color-mix(in srgb, var(--primary) ${percent}%, transparent)`
}

export const AUTH_BG_LIGHT = 'var(--muted)'

export const AUTH_BG_DARK = 'var(--background)'

export const ORB_GLOW_LIGHT = `radial-gradient(circle closest-side, ${primaryMix(50)} 0%, ${primaryMix(22)} 45%, transparent 100%)`

export const MAP_GLOW_LIGHT = `radial-gradient(circle closest-side, ${primaryMix(24)} 0%, ${primaryMix(10)} 42%, transparent 100%)`

export const MAP_GLOW_DARK = `radial-gradient(circle closest-side, ${primaryMix(11)} 0%, ${primaryMix(6)} 30%, ${primaryMix(2)} 55%, transparent 80%)`

export const ORB_GLOW_DARK = `radial-gradient(circle closest-side, ${primaryMix(14)} 0%, ${primaryMix(8)} 30%, ${primaryMix(4)} 55%, ${primaryMix(2)} 75%, transparent 95%)`

export const NODE_DOT_STYLE = {
  background: `radial-gradient(circle at 38% 35%, var(--map-node), ${primaryMix(70)} 55%, var(--map-accent))`,
  boxShadow: `0 2px 14px ${primaryMix(25)}, inset 0 1px 3px color-mix(in srgb, var(--map-node) 65%, transparent)`,
  border: `0.5px solid ${primaryMix(30)}`,
} as const

export const CONNECTOR_LINE_LIGHT = primaryMix(22)
export const ORB_LABEL_LIGHT = 'color-mix(in srgb, var(--map-label) 45%, transparent)'
export const ORB_GRID_LIGHT = 'var(--map-grid)'

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
  base: 'var(--mesh-base)',
  baseDark: 'var(--mesh-base)',
  blobA: 'var(--primary)',
  blobB: 'var(--chart-3)',
  blobC: 'var(--primary-pale)',
  dotInk: 'color-mix(in srgb, var(--foreground) 16%, transparent)',
  dotInkDark: 'color-mix(in srgb, var(--foreground) 12%, transparent)',
} as const

export const SIRI_ORB = {
  light: {
    bg: 'var(--mesh-base)',
    c1: 'var(--primary-deep)',
    c2: 'var(--chart-3)',
    c3: 'var(--primary)',
  },
  dark: {
    bg: 'var(--mesh-base)',
    c1: 'var(--primary)',
    c2: 'var(--chart-3)',
    c3: 'var(--primary-pale)',
  },
} as const
