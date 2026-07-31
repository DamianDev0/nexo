import type { TenantTheme } from '../interfaces/tenant-theme.interface'
import { ThemeCssService } from '../services/theme-css.service'

function buildTheme(overrides: Partial<TenantTheme['colors']> = {}): TenantTheme {
  return {
    colors: {
      primary: '#1B4FD8',
      primaryForeground: '#FFFFFF',
      secondary: '#6366F1',
      accent: '#818CF8',
      sidebar: '#0F172A',
      sidebarForeground: '#F8FAFC',
      ...overrides,
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
}

describe('ThemeCssService', () => {
  const service = new ThemeCssService()

  it('emits :root and .dark blocks', () => {
    const css = service.build(buildTheme())
    expect(css).toContain(':root {')
    expect(css).toContain('.dark {')
  })

  it('emits the full shadcn token set, not just the brand seeds', () => {
    const css = service.build(buildTheme())
    for (const token of [
      '--background',
      '--card',
      '--muted',
      '--border',
      '--ring',
      '--chart-1',
      '--sidebar-ring',
    ]) {
      expect(css).toContain(token)
    }
  })

  it('applies the brand primary to --primary and --ring', () => {
    const css = service.build(buildTheme())
    expect(css).toContain('--primary: #1B4FD8;')
    expect(css).toContain('--ring: #1B4FD8;')
  })

  it('emits every token the web app declares, in both schemes', () => {
    const css = service.build(buildTheme())
    const [root, dark] = css.split('.dark {')

    for (const token of [
      '--row-selected',
      '--row-hover',
      '--row-divider',
      '--border-strong',
      '--body',
      '--faint',
      '--disabled-fg',
      '--mesh-base',
      '--map-accent',
      '--map-grid',
      '--map-label',
      '--map-node',
    ]) {
      expect(root).toContain(`${token}:`)
      expect(dark).toContain(`${token}:`)
    }
  })

  it('emits validated typography vars', () => {
    const css = service.build(buildTheme())
    expect(css).toContain('--font-ui:')
    expect(css).toContain('--radius-sm:')
    expect(css).toContain('--radius-xl:')
    expect(css).toContain('--density: comfortable;')
  })

  it('never injects the company name into CSS', () => {
    const css = service.build(buildTheme())
    expect(css).not.toContain('company-name')
    expect(css).not.toContain('Acme')
  })

  it('drops non-hex color values (CSS injection guard)', () => {
    const malicious = '#1B4FD8; } body { display: none } :root {'
    const css = service.build(buildTheme({ primary: malicious }))
    expect(css).not.toContain('body { display: none }')
    expect(css).not.toContain('--primary: #1B4FD8; }')
  })
})
