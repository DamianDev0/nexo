import { Injectable } from '@nestjs/common'
import type { ThemeTypography } from '@repo/shared-types'
import type { TenantTheme } from '../interfaces/tenant-theme.interface'
import type { ThemeTokens } from '../interfaces/theme-tokens.interface'
import { isHexColor } from '@repo/shared-utils'
import { BORDER_RADIUS_MAP, FONT_FAMILY_MAP } from '../constants/default-theme'
import { resolveThemeTokens } from './theme-token.resolver'

const DENSITY_VALUES: readonly ThemeTypography['density'][] = ['compact', 'comfortable', 'spacious']
const DENSITIES = new Set<ThemeTypography['density']>(DENSITY_VALUES)

@Injectable()
export class ThemeCssService {
  build(theme: TenantTheme): string {
    const { light, dark } = resolveThemeTokens(theme)
    const root = this.renderBlock(':root', [
      ...this.colorLines(light),
      ...this.typographyLines(theme),
    ])
    const darkBlock = this.renderBlock('.dark', this.colorLines(dark))
    return `${root}\n\n${darkBlock}\n`
  }

  private colorLines(tokens: ThemeTokens): string[] {
    return Object.entries(tokens)
      .filter(([, value]) => isHexColor(value))
      .map(([name, value]) => `  --${name}: ${value};`)
  }

  private typographyLines(theme: TenantTheme): string[] {
    const font = FONT_FAMILY_MAP[theme.typography.fontFamily] ?? FONT_FAMILY_MAP.inter
    const radius = BORDER_RADIUS_MAP[theme.typography.borderRadius] ?? BORDER_RADIUS_MAP.md
    const density = DENSITIES.has(theme.typography.density)
      ? theme.typography.density
      : 'comfortable'
    return [`  --font-family: ${font};`, `  --radius: ${radius};`, `  --density: ${density};`]
  }

  private renderBlock(selector: string, lines: string[]): string {
    return `${selector} {\n${lines.join('\n')}\n}`
  }
}
