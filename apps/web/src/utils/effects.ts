// ─── Shared visual effects (backgrounds, glows, gradients) ──────────
// Used across auth, landing, and marketing pages.

/** Warm gradient background for auth pages — light */
export const AUTH_BG_LIGHT = `
  radial-gradient(ellipse 72% 62% at 14% 82%, rgba(182,154,122,0.92) 0%, transparent 52%),
  radial-gradient(ellipse 62% 58% at 86% 14%, rgba(218,204,182,0.88) 0%, transparent 52%),
  radial-gradient(ellipse 50% 50% at 52% 52%, rgba(200,183,160,0.5) 0%, transparent 58%),
  #c9c0b6
`

/** Warm gradient background for auth pages — dark */
export const AUTH_BG_DARK = `
  radial-gradient(ellipse 72% 62% at 14% 82%, rgba(30,25,20,0.9) 0%, transparent 52%),
  radial-gradient(ellipse 62% 58% at 86% 14%, rgba(35,30,25,0.85) 0%, transparent 52%),
  radial-gradient(ellipse 50% 50% at 52% 52%, rgba(25,20,15,0.5) 0%, transparent 58%),
  #0a0a0a
`

/** Soft glow behind panels — light */
export const PANEL_GLOW_LIGHT =
  'radial-gradient(ellipse 100% 70% at 50% 50%, rgba(255,220,170,0.25) 0%, transparent 70%)'

/** Soft glow behind panels — dark */
export const PANEL_GLOW_DARK =
  'radial-gradient(ellipse 100% 70% at 50% 50%, rgba(200,140,60,0.06) 0%, transparent 70%)'

// ─── Orb styles (same in both modes — the orb is always orange) ─────

export const ORB_GRADIENT =
  'radial-gradient(circle at 36% 32%, #ffc870 0%, #e98520 36%, #c85c10 65%, #9e3a08 84%, #7a2a05 100%)'

export const ORB_SHADOW =
  '0 28px 72px rgba(165,68,10,0.42), 0 8px 28px rgba(208,98,18,0.22), inset 0 -14px 38px rgba(0,0,0,0.22), inset 6px 6px 22px rgba(255,195,90,0.13)'

export const ORB_SPECULAR = 'radial-gradient(ellipse, rgba(255,253,240,0.55) 0%, transparent 80%)'

export const ORB_RIM_LIGHT = 'radial-gradient(ellipse, rgba(255,180,80,0.25) 0%, transparent 80%)'

// ─── Node dot gradient (for orb network nodes) ─────────────────────

export const NODE_DOT_STYLE = {
  background: 'radial-gradient(circle at 38% 35%, #fff7e8, #e5c07a 55%, #c49030)',
  boxShadow: '0 2px 14px rgba(200,130,0,0.25), inset 0 1px 3px rgba(255,245,224,0.65)',
  border: '0.5px solid rgba(212,160,48,0.3)',
} as const

// ─── SVG line colors ────────────────────────────────────────────────

export const CONNECTOR_LINE_LIGHT = 'rgba(180,120,30,0.22)'
export const CONNECTOR_LINE_DARK = 'rgba(200,150,60,0.18)'
