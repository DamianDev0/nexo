import { Injectable } from '@nestjs/common'
import type { TenantTheme } from '../interfaces/tenant-theme.interface'
import type { ThemeTokens } from '../interfaces/theme-tokens.interface'
import { isHexColor } from '@/shared/color/color.util'
import { BORDER_RADIUS_MAP, FONT_FAMILY_MAP } from '../constants/default-theme'
import { resolveThemeTokens } from './theme-token.resolver'

const DENSITIES = new Set(['compact', 'comfortable', 'spacious'])

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
