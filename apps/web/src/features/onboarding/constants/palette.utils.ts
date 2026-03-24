import type { ThemeColors } from '@repo/shared-types'

function hexToHsl(hex: string): [number, number, number] {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return [0, 0, l]

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100
  const lN = l / 100

  const a = sN * Math.min(lN, 1 - lN)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }

  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase()
}

/**
 * Derives a full ThemeColors palette from a primary hex color.
 * Overrides allow the user to customize individual colors.
 */
export function derivePalette(
  primary: string,
  overrides?: Partial<Omit<ThemeColors, 'primary' | 'primaryForeground'>>,
): ThemeColors {
  const [h, s] = hexToHsl(primary)

  return {
    primary,
    primaryForeground: '#FFFFFF',
    accent: overrides?.accent ?? hslToHex(h, Math.min(s, 30), 95),
    secondary: overrides?.secondary ?? hslToHex(h, Math.min(s, 10), 97),
    sidebar: overrides?.sidebar ?? hslToHex(h, Math.min(s, 15), 96),
    sidebarForeground: overrides?.sidebarForeground ?? hslToHex(h, Math.min(s, 20), 15),
  }
}

/**
 * Inverts a light palette to dark mode equivalents.
 */
export function deriveDarkPalette(colors: ThemeColors): ThemeColors {
  const [h, s] = hexToHsl(colors.primary)

  return {
    primary: colors.primary,
    primaryForeground: '#FFFFFF',
    accent: hslToHex(h, Math.min(s, 20), 15),
    secondary: hslToHex(h, Math.min(s, 8), 8),
    sidebar: hslToHex(h, Math.min(s, 10), 6),
    sidebarForeground: hslToHex(h, Math.min(s, 15), 92),
  }
}
