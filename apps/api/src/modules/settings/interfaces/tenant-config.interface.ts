import type { ActivityTypeDef } from '@repo/shared-types'
import type {
  TenantTheme,
  TenantThemeColors,
  TenantThemeTypography,
  TenantThemeBranding,
} from './tenant-theme.interface'
import type { ContactTaxonomy } from '@repo/shared-types'
import type { TenantNomenclature } from './nomenclature.interface'
import type { SidebarConfig } from './sidebar-config.interface'
import type { CustomFieldsConfig, FieldPermissionsConfig } from './custom-field.interface'

export type ThemePatch = {
  colors?: Partial<TenantThemeColors>
  typography?: Partial<TenantThemeTypography>
  branding?: Partial<TenantThemeBranding>
  iconPack?: TenantTheme['iconPack']
  darkModeDefault?: TenantTheme['darkModeDefault']
}

export interface TenantFullConfig {
  theme?: TenantTheme
  nomenclature?: TenantNomenclature
  sidebarConfig?: SidebarConfig
  customFields?: CustomFieldsConfig
  fieldPermissions?: FieldPermissionsConfig
  activityTypes?: ActivityTypeDef[]
  contactTaxonomy?: ContactTaxonomy
  [key: string]: unknown
}
