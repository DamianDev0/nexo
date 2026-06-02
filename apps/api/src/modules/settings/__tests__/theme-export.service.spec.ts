import type { TenantTheme } from '../interfaces/tenant-theme.interface'
import { ThemeCssService } from '../services/theme-css.service'
import { ThemeExportService } from '../services/theme-export.service'

const THEME: TenantTheme = {
  colors: {
    primary: '#1B4FD8',
    primaryForeground: '#FFFFFF',
    secondary: '#6366F1',
    accent: '#818CF8',
    sidebar: '#0F172A',
    sidebarForeground: '#F8FAFC',
  },
  typography: { fontFamily: 'inter', borderRadius: 'md', density: 'comfortable' },
  branding: {
    logoUrl: null,
    faviconUrl: null,
    loginBgUrl: null,
    companyName: 'Acme',
    loginTagline: null,
  },
  iconPack: 'outline',
  darkModeDefault: 'system',
}

describe('ThemeExportService', () => {
  const service = new ThemeExportService(new ThemeCssService())

  it('exports a shadcn CSS-vars block', () => {
    const css = service.toCss(THEME)
    expect(css).toContain(':root {')
    expect(css).toContain('--primary: #1B4FD8;')
  })

  it('exports a DTCG document with light and dark color groups', () => {
    const doc = service.toDtcg(THEME)
    expect(doc.color.light.primary).toEqual({ $type: 'color', $value: '#1B4FD8' })
    expect(doc.color.dark.primary?.$type).toBe('color')
    expect(Object.keys(doc.color.light).length).toBeGreaterThan(20)
  })

  it('round-trips: exported CSS re-imports to the same primary seed', () => {
    const css = service.toCss(THEME)
    expect(css).toContain('--primary: #1B4FD8;')
  })
})
