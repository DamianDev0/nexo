import type { TenantTheme } from '../interfaces/tenant-theme.interface'
import type { ResolvedThemeTokens, ThemeTokens } from '../interfaces/theme-tokens.interface'
import {
  hexToOklch,
  oklchToHex,
  readableForeground,
  rotateHue,
  tintedNeutral,
} from '@/shared/color/color.util'

const DESTRUCTIVE = '#ef4444'

interface BrandSeeds {
  primary: string
  primaryForeground: string
  secondary: string
  accent: string
  sidebar: string
  sidebarForeground: string
}

function blendLightness(base: string, target: string, t: number): string {
  const b = hexToOklch(base)
  const goal = hexToOklch(target)
  if (!b || !goal) return base
  return oklchToHex({ l: b.l + (goal.l - b.l) * t, c: b.c, h: b.h })
}

function deriveCharts(
  primary: string,
  accent: string,
  secondary: string,
): [string, string, string, string, string] {
  return [primary, accent, secondary, rotateHue(primary, 40), rotateHue(accent, -40)]
}

function buildLight(seeds: BrandSeeds): ThemeTokens {
  const p = seeds.primary
  const fg = tintedNeutral(p, 0.18, 0.012)
  const surface = tintedNeutral(p, 0.99, 0.004)
  const border = tintedNeutral(p, 0.922, 0.012)
  const [c1, c2, c3, c4, c5] = deriveCharts(p, seeds.accent, seeds.secondary)

  return {
    background: tintedNeutral(p, 0.995, 0.003),
    foreground: fg,
    card: surface,
    'card-foreground': fg,
    popover: surface,
    'popover-foreground': fg,
    primary: p,
    'primary-foreground': seeds.primaryForeground,
    secondary: seeds.secondary,
    'secondary-foreground': readableForeground(seeds.secondary),
    muted: tintedNeutral(p, 0.968, 0.012),
    'muted-foreground': tintedNeutral(p, 0.55, 0.022),
    accent: seeds.accent,
    'accent-foreground': readableForeground(seeds.accent),
    destructive: DESTRUCTIVE,
    'destructive-foreground': readableForeground(DESTRUCTIVE),
    border,
    input: border,
    ring: p,
    'chart-1': c1,
    'chart-2': c2,
    'chart-3': c3,
    'chart-4': c4,
    'chart-5': c5,
    sidebar: seeds.sidebar,
    'sidebar-foreground': seeds.sidebarForeground,
    'sidebar-primary': p,
    'sidebar-primary-foreground': seeds.primaryForeground,
    'sidebar-accent': blendLightness(seeds.sidebar, seeds.sidebarForeground, 0.12),
    'sidebar-accent-foreground': seeds.sidebarForeground,
    'sidebar-border': blendLightness(seeds.sidebar, seeds.sidebarForeground, 0.18),
    'sidebar-ring': p,
  }
}

function buildDark(seeds: BrandSeeds): ThemeTokens {
  const p = seeds.primary
  const fg = tintedNeutral(p, 0.97, 0.004)
  const surface = tintedNeutral(p, 0.21, 0.012)
  const border = tintedNeutral(p, 0.3, 0.014)
  const sidebar = blendLightness(seeds.sidebar, '#000000', 0.15)
  const [c1, c2, c3, c4, c5] = deriveCharts(p, seeds.accent, seeds.secondary)

  return {
    background: tintedNeutral(p, 0.17, 0.01),
    foreground: fg,
    card: surface,
    'card-foreground': fg,
    popover: surface,
    'popover-foreground': fg,
    primary: p,
    'primary-foreground': readableForeground(p),
    secondary: tintedNeutral(p, 0.27, 0.012),
    'secondary-foreground': fg,
    muted: tintedNeutral(p, 0.27, 0.014),
    'muted-foreground': tintedNeutral(p, 0.72, 0.02),
    accent: tintedNeutral(p, 0.27, 0.012),
    'accent-foreground': fg,
    destructive: DESTRUCTIVE,
    'destructive-foreground': readableForeground(DESTRUCTIVE),
    border,
    input: border,
    ring: p,
    'chart-1': c1,
    'chart-2': c2,
    'chart-3': c3,
    'chart-4': c4,
    'chart-5': c5,
    sidebar,
    'sidebar-foreground': seeds.sidebarForeground,
    'sidebar-primary': p,
    'sidebar-primary-foreground': readableForeground(p),
    'sidebar-accent': blendLightness(sidebar, seeds.sidebarForeground, 0.14),
    'sidebar-accent-foreground': seeds.sidebarForeground,
    'sidebar-border': blendLightness(sidebar, seeds.sidebarForeground, 0.2),
    'sidebar-ring': p,
  }
}

export function resolveThemeTokens(theme: TenantTheme): ResolvedThemeTokens {
  const seeds: BrandSeeds = {
    primary: theme.colors.primary,
    primaryForeground: theme.colors.primaryForeground,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    sidebar: theme.colors.sidebar,
    sidebarForeground: theme.colors.sidebarForeground,
  }

  return { light: buildLight(seeds), dark: buildDark(seeds) }
}
