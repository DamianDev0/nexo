import { Injectable } from '@nestjs/common'
import type { TenantTheme } from '../interfaces/tenant-theme.interface'
import type { ThemeTokens } from '../interfaces/theme-tokens.interface'
import type { DtcgColorGroup, DtcgThemeDocument } from '../interfaces/theme-dtcg.interface'
import { ThemeCssService } from './theme-css.service'
import { resolveThemeTokens } from './theme-token.resolver'

function toColorGroup(tokens: ThemeTokens): DtcgColorGroup {
  return Object.fromEntries(
    Object.entries(tokens).map(([name, value]) => [name, { $type: 'color', $value: value }]),
  )
}

@Injectable()
export class ThemeExportService {
  constructor(private readonly css: ThemeCssService) {}

  toCss(theme: TenantTheme): string {
    return this.css.build(theme)
  }

  toDtcg(theme: TenantTheme): DtcgThemeDocument {
    const { light, dark } = resolveThemeTokens(theme)
    return {
      $description: 'NexoCRM design tokens (W3C DTCG)',
      color: {
        light: toColorGroup(light),
        dark: toColorGroup(dark),
      },
    }
  }
}
