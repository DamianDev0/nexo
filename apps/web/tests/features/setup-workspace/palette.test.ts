import { readableForeground, resolveThemeTokens, tintedNeutral } from '@repo/shared-utils'
import { describe, expect, it } from 'vitest'

import { deriveDarkPalette, derivePalette } from '@/features/setup-workspace/lib/palette'

describe('derivePalette', () => {
  it('derives every color from the primary when no overrides are given', () => {
    const primary = '#3b82f6'

    const result = derivePalette(primary)

    expect(result).toEqual({
      primary,
      primaryForeground: readableForeground(primary),
      accent: tintedNeutral(primary, 0.96, 0.03),
      secondary: tintedNeutral(primary, 0.975, 0.008),
      sidebar: tintedNeutral(primary, 0.97, 0.012),
      sidebarForeground: tintedNeutral(primary, 0.25, 0.02),
    })
  })

  it('prefers explicit overrides over the derived tints', () => {
    const primary = '#22c55e'
    const overrides = {
      accent: '#111111',
      secondary: '#222222',
      sidebar: '#333333',
      sidebarForeground: '#444444',
    }

    const result = derivePalette(primary, overrides)

    expect(result).toEqual({
      primary,
      primaryForeground: readableForeground(primary),
      accent: '#111111',
      secondary: '#222222',
      sidebar: '#333333',
      sidebarForeground: '#444444',
    })
  })

  it('falls back per-field when only some overrides are provided', () => {
    const primary = '#f97316'

    const result = derivePalette(primary, { accent: '#abcdef' })

    expect(result.accent).toBe('#abcdef')
    expect(result.secondary).toBe(tintedNeutral(primary, 0.975, 0.008))
    expect(result.sidebar).toBe(tintedNeutral(primary, 0.97, 0.012))
    expect(result.sidebarForeground).toBe(tintedNeutral(primary, 0.25, 0.02))
  })
})

describe('deriveDarkPalette', () => {
  it('maps the dark token set to the theme colors shape', () => {
    const colors = {
      primary: '#3b82f6',
      primaryForeground: '#0a0a0a',
      secondary: '#1d4ed8',
      accent: '#60a5fa',
      sidebar: '#0f172a',
      sidebarForeground: '#f8fafc',
    }

    const result = deriveDarkPalette(colors)
    const { dark } = resolveThemeTokens(colors)

    expect(result).toEqual({
      primary: dark.primary,
      primaryForeground: dark['primary-foreground'],
      secondary: dark.secondary,
      accent: dark.accent,
      sidebar: dark.sidebar,
      sidebarForeground: dark['sidebar-foreground'],
    })
  })
})
