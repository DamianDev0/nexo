import { contrastRatio, resolveThemeTokens } from '@repo/shared-utils'
import { describe, expect, it } from 'vitest'

import type { ThemeColors } from '@repo/shared-types'

function seeds(primary: string): ThemeColors {
  return {
    primary,
    primaryForeground: '#0E0F0C',
    secondary: '#7FD6C2',
    accent: '#DFF3C6',
    sidebar: '#0E0F0C',
    sidebarForeground: '#F4F6F0',
  }
}

describe('resolveThemeTokens primary contrast', () => {
  it('flips the foreground to light on a dark tenant primary', () => {
    const { light } = resolveThemeTokens(seeds('#3d6a7d'))

    expect(contrastRatio(light.primary, light['primary-foreground'])).toBeGreaterThanOrEqual(4.5)
    expect(light['primary-foreground']).toBe('#fafafa')
  })

  it('keeps a dark foreground on a bright lime primary', () => {
    const { light } = resolveThemeTokens(seeds('#A5E96F'))

    expect(light['primary-foreground']).toBe('#0a0a0a')
    expect(contrastRatio(light.primary, light['primary-foreground'])).toBeGreaterThanOrEqual(4.5)
  })

  it('meets contrast in dark mode regardless of the stored seed foreground', () => {
    const { dark } = resolveThemeTokens(seeds('#3d6a7d'))

    expect(contrastRatio(dark.primary, dark['primary-foreground'])).toBeGreaterThanOrEqual(4.5)
  })
})
