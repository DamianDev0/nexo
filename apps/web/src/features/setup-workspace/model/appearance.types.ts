import type { SidebarModule, TenantTheme, ThemeColors, ThemeTypography } from '@repo/shared-types'

export type ThemeMode = 'light' | 'dark' | 'system'
export type OverridableColorKey = 'accent' | 'secondary' | 'sidebar' | 'sidebarForeground'

export interface AppearanceData {
  readonly primaryColor: string
  readonly colors: ThemeColors
  readonly grainIntensity: number
  readonly darkMode: ThemeMode
  readonly fontFamily: ThemeTypography['fontFamily']
  readonly borderRadius: ThemeTypography['borderRadius']
  readonly density: ThemeTypography['density']
  readonly productName: string
  readonly tagline: string
  readonly logoPreview: string | null
  readonly logoFileName: string | null
  readonly navModules: ReadonlyArray<SidebarModule>
}

export interface AppearanceActions {
  readonly onPrimaryColorChange: (v: string) => void
  readonly onColorOverride: (key: OverridableColorKey, v: string) => void
  readonly onGrainIntensityChange: (v: number) => void
  readonly onDarkModeChange: (v: ThemeMode) => void
  readonly onFontFamilyChange: (v: ThemeTypography['fontFamily']) => void
  readonly onBorderRadiusChange: (v: ThemeTypography['borderRadius']) => void
  readonly onDensityChange: (v: ThemeTypography['density']) => void
  readonly onProductNameChange: (v: string) => void
  readonly onTaglineChange: (v: string) => void
  readonly onLogoUpload: (file: File) => Promise<unknown>
  readonly onLogoRemove: () => void
  readonly onRestoreTheme: (config: Partial<TenantTheme>) => void
}
