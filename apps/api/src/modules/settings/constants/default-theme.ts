import { NEXO_BRAND_PALETTE } from '@repo/shared-utils'
import type { TenantTheme } from '../interfaces/tenant-theme.interface'

export const DEFAULT_THEME: TenantTheme = {
  colors: { ...NEXO_BRAND_PALETTE },
  typography: {
    fontFamily: 'inter',
    borderRadius: 'sm',
    density: 'comfortable',
  },
  branding: {
    logoUrl: null,
    faviconUrl: null,
    loginBgUrl: null,
    companyName: 'NexoCRM',
    loginTagline: null,
  },
  iconPack: 'outline',
  darkModeDefault: 'system',
}

export const BORDER_RADIUS_MAP: Record<TenantTheme['typography']['borderRadius'], string> = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
}

export const FONT_FAMILY_MAP: Record<TenantTheme['typography']['fontFamily'], string> = {
  inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif",
  poppins: "'Poppins', sans-serif",
  nunito: "'Nunito', sans-serif",
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
