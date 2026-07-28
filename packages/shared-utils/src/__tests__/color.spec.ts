import {
  blendLightness,
  contrastRatio,
  hexToOklch,
  isHexColor,
  oklchToHex,
  parseHex,
  readableForeground,
  relativeLuminance,
  resolveThemeTokens,
  rotateHue,
  tintedNeutral,
} from '../color'

import type { ThemeColors } from '@repo/shared-types'

describe('color', () => {
  describe('isHexColor', () => {
    it('accepts 3- and 6-digit hex', () => {
      expect(isHexColor('#fff')).toBe(true)
      expect(isHexColor('#1B4FD8')).toBe(true)
    })

    it('rejects malformed or injection-laden values', () => {
      expect(isHexColor('red')).toBe(false)
      expect(isHexColor('#1B4FD8; } body{}')).toBe(false)
      expect(isHexColor('rgb(0,0,0)')).toBe(false)
      expect(isHexColor('#12')).toBe(false)
    })
  })

  describe('parseHex', () => {
    it('expands shorthand', () => {
      expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    })

    it('parses full form', () => {
      expect(parseHex('#1B4FD8')).toEqual({ r: 27, g: 79, b: 216 })
    })

    it('returns null for invalid input', () => {
      expect(parseHex('nope')).toBeNull()
    })
  })

  describe('contrastRatio', () => {
    it('is 21 for black on white', () => {
      expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
    })

    it('is 1 for identical colors', () => {
      expect(contrastRatio('#1B4FD8', '#1B4FD8')).toBeCloseTo(1, 5)
    })
  })

  describe('readableForeground', () => {
    it('picks dark text on a light background', () => {
      expect(readableForeground('#ffffff')).toBe('#0a0a0a')
    })

    it('picks light text on a dark background', () => {
      expect(readableForeground('#0F172A')).toBe('#fafafa')
    })

    it('keeps WCAG AA contrast on a saturated brand color', () => {
      const fg = readableForeground('#1B4FD8')
      expect(contrastRatio('#1B4FD8', fg)).toBeGreaterThanOrEqual(4.5)
    })
  })

  describe('OKLCH', () => {
    it('round-trips a color within 1 channel step', () => {
      const oklch = hexToOklch('#1B4FD8')
      if (!oklch) throw new Error('expected a parsed color')
      const back = parseHex(oklchToHex(oklch))
      const orig = parseHex('#1B4FD8')
      expect(Math.abs((back?.r ?? 0) - (orig?.r ?? 0))).toBeLessThanOrEqual(1)
      expect(Math.abs((back?.g ?? 0) - (orig?.g ?? 0))).toBeLessThanOrEqual(1)
      expect(Math.abs((back?.b ?? 0) - (orig?.b ?? 0))).toBeLessThanOrEqual(1)
    })

    it('tintedNeutral lifts lightness above the saturated brand color', () => {
      expect(relativeLuminance(tintedNeutral('#1B4FD8', 0.96))).toBeGreaterThan(
        relativeLuminance('#1B4FD8'),
      )
    })

    it('tintedNeutral stays near-neutral (very low chroma)', () => {
      const neutral = tintedNeutral('#1B4FD8', 0.95, 0.01)
      expect(hexToOklch(neutral)?.c).toBeLessThan(0.03)
    })

    it('rotateHue shifts hue by the requested degrees', () => {
      const base = hexToOklch('#1B4FD8')?.h ?? 0
      const rotated = hexToOklch(rotateHue('#1B4FD8', 40))?.h ?? 0
      expect((rotated - base + 360) % 360).toBeCloseTo(40, 0)
    })

    it('always returns a valid hex', () => {
      expect(isHexColor(oklchToHex({ l: 0.5, c: 0.2, h: 250 }))).toBe(true)
      expect(isHexColor(tintedNeutral('#1B4FD8', 0.97))).toBe(true)
    })
  })

  describe('blendLightness', () => {
    it('moves lightness toward the target', () => {
      const base = hexToOklch('#0F172A')?.l ?? 0
      const blended = hexToOklch(blendLightness('#0F172A', '#F8FAFC', 0.5))?.l ?? 0
      expect(blended).toBeGreaterThan(base)
    })

    it('returns base for invalid inputs', () => {
      expect(blendLightness('nope', '#ffffff', 0.5)).toBe('nope')
    })
  })

  describe('resolveThemeTokens', () => {
    const seeds: ThemeColors = {
      primary: '#1B4FD8',
      primaryForeground: '#FFFFFF',
      secondary: '#6366F1',
      accent: '#818CF8',
      sidebar: '#0F172A',
      sidebarForeground: '#F8FAFC',
    }

    it('passes seed colors through the light tokens', () => {
      const { light } = resolveThemeTokens(seeds)
      expect(light.primary).toBe(seeds.primary)
      expect(light['primary-foreground']).toBe(seeds.primaryForeground)
      expect(light.secondary).toBe(seeds.secondary)
      expect(light.accent).toBe(seeds.accent)
      expect(light.sidebar).toBe(seeds.sidebar)
      expect(light['sidebar-foreground']).toBe(seeds.sidebarForeground)
    })

    it('derives dark surfaces from the primary hue', () => {
      const { dark } = resolveThemeTokens(seeds)
      expect(dark.primary).toBe(seeds.primary)
      expect(dark['primary-foreground']).toBe(readableForeground(seeds.primary))
      expect(dark.secondary).toBe(tintedNeutral(seeds.primary, 0.27, 0.012))
      expect(dark.sidebar).toBe(blendLightness(seeds.sidebar, '#000000', 0.15))
    })

    it('emits only valid hex tokens', () => {
      const { light, dark } = resolveThemeTokens(seeds)
      for (const value of [...Object.values(light), ...Object.values(dark)]) {
        expect(isHexColor(value)).toBe(true)
      }
    })
  })
})
