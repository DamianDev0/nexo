import { resolveThemeTokens as resolveFromSeeds } from '@repo/shared-utils'
import type { TenantTheme } from '../interfaces/tenant-theme.interface'
import type { ResolvedThemeTokens } from '../interfaces/theme-tokens.interface'

export function resolveThemeTokens(theme: TenantTheme): ResolvedThemeTokens {
  return resolveFromSeeds(theme.colors)
}
