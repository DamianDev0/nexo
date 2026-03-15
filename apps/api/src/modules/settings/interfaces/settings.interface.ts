import type { PipelineStagePreset } from '../constants/industry-presets'
export type { TenantTheme } from './tenant-theme.interface'
export type { TenantNomenclature } from './nomenclature.interface'
export type { SidebarConfig } from './sidebar-config.interface'
export type { CustomFieldsConfig, FieldPermissionsConfig } from './custom-field.interface'

export interface SettingsAddress {
  street?: string
  city?: string
  department?: string
  zipCode?: string
}

export interface SettingsBusiness {
  nit?: string
  taxRegime?: string
  address?: SettingsAddress
  phone?: string
  email?: string
  website?: string
}

export interface SettingsI18n {
  language?: string
  timezone?: string
  currency?: string
  dateFormat?: string
  numberFormat?: string
}

export interface SettingsBilling {
  legalName?: string
  municipalityCode?: string
  fiscalResponsibilities?: string[]
}

export interface SettingsNomenclature {
  contacts?: string
  companies?: string
  deals?: string
}

export interface SettingsIndustry {
  sector?: string
  nomenclature?: SettingsNomenclature
  iconPack?: string
  pipelinePreset?: PipelineStagePreset[]
}

export interface TenantConfig {
  business?: SettingsBusiness
  i18n?: SettingsI18n
  billing?: SettingsBilling
  industry?: SettingsIndustry
}
