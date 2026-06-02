import {
  contrastRatio,
  hexToOklch,
  isHexColor,
  oklchToHex,
  parseHex,
  readableForeground,
  relativeLuminance,
  rotateHue,
  tintedNeutral,
} from '../color.util'

describe('color.util', () => {
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
})
