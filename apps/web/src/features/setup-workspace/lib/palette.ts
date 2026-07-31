import { readableForeground, resolveThemeTokens, tintedNeutral } from '@repo/shared-utils'

import type { ColorOverrides } from '../model/types'
import type { ThemeColors } from '@repo/shared-types'

export function derivePalette(primary: string, overrides?: ColorOverrides): ThemeColors {
  return {
    primary,
    primaryForeground: readableForeground(primary),
    accent: overrides?.accent ?? tintedNeutral(primary, 0.96, 0.03),
    secondary: overrides?.secondary ?? tintedNeutral(primary, 0.975, 0.008),
    sidebar: overrides?.sidebar ?? tintedNeutral(primary, 0.97, 0.012),
    sidebarForeground: overrides?.sidebarForeground ?? tintedNeutral(primary, 0.25, 0.02),
  }
}

export function deriveDarkPalette(colors: ThemeColors): ThemeColors {
  const { dark } = resolveThemeTokens(colors)
  return {
    primary: dark.primary,
    primaryForeground: dark['primary-foreground'],
    secondary: dark.secondary,
    accent: dark.accent,
    sidebar: dark.sidebar,
    sidebarForeground: dark['sidebar-foreground'],
  }
}
