export interface Rgb {
  r: number
  g: number
  b: number
}

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function isHexColor(value: string): boolean {
  return HEX_PATTERN.test(value)
}

export function parseHex(hex: string): Rgb | null {
  if (!isHexColor(hex)) return null

  let body = hex.slice(1)
  if (body.length === 3) {
    body = body
      .split('')
      .map((c) => c + c)
      .join('')
  }

  return {
    r: Number.parseInt(body.slice(0, 2), 16),
    g: Number.parseInt(body.slice(2, 4), 16),
    b: Number.parseInt(body.slice(4, 6), 16),
  }
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

export function toHex({ r, g, b }: Rgb): string {
  const channel = (value: number): string => clampChannel(value).toString(16).padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`
}

export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex)
  if (!rgb) return 0

  const linear = (channel: number): number => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * linear(rgb.r) + 0.7152 * linear(rgb.g) + 0.0722 * linear(rgb.b)
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [light, dark] = la >= lb ? [la, lb] : [lb, la]
  return (light + 0.05) / (dark + 0.05)
}

export function readableForeground(
  background: string,
  light = '#fafafa',
  dark = '#0a0a0a',
): string {
  return contrastRatio(background, dark) >= contrastRatio(background, light) ? dark : light
}

export interface Oklch {
  l: number
  c: number
  h: number
}

function srgbToLinear(channel: number): number {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(channel: number): number {
  const c = channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055
  return clampChannel(c * 255)
}

export function hexToOklch(hex: string): Oklch | null {
  const rgb = parseHex(hex)
  if (!rgb) return null

  const r = srgbToLinear(rgb.r)
  const g = srgbToLinear(rgb.g)
  const b = srgbToLinear(rgb.b)

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)

  const labL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const labA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const labB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s

  const c = Math.hypot(labA, labB)
  let h = (Math.atan2(labB, labA) * 180) / Math.PI
  if (h < 0) h += 360

  return { l: labL, c, h }
}

export function oklchToHex({ l, c, h }: Oklch): string {
  const hr = (h * Math.PI) / 180
  const labA = c * Math.cos(hr)
  const labB = c * Math.sin(hr)

  const l_ = (l + 0.3963377774 * labA + 0.2158037573 * labB) ** 3
  const m_ = (l - 0.1055613458 * labA - 0.0638541728 * labB) ** 3
  const s_ = (l - 0.0894841775 * labA - 1.291485548 * labB) ** 3

  return toHex({
    r: linearToSrgb(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    g: linearToSrgb(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    b: linearToSrgb(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  })
}

export function tintedNeutral(brand: string, lightness: number, chroma = 0.01): string {
  const base = hexToOklch(brand)
  if (!base) return oklchToHex({ l: lightness, c: 0, h: 0 })
  return oklchToHex({ l: lightness, c: chroma, h: base.h })
}

export function rotateHue(hex: string, degrees: number): string {
  const base = hexToOklch(hex)
  if (!base) return hex
  return oklchToHex({ l: base.l, c: base.c, h: (base.h + degrees + 360) % 360 })
}
