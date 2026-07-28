import type { GeneralSettings, OnboardingStatus } from '@repo/shared-types'
import type { PipelineStagePreset } from '../constants/industry-presets'
export type { TenantTheme } from './tenant-theme.interface'
export type { TenantNomenclature } from './nomenclature.interface'
export type { SidebarConfig } from './sidebar-config.interface'
export type { CustomFieldsConfig, FieldPermissionsConfig } from './custom-field.interface'

export type SettingsBusiness = GeneralSettings['business']
export type SettingsI18n = GeneralSettings['i18n']
export type SettingsBilling = GeneralSettings['billing']
export type SettingsIndustry = GeneralSettings['industry'] & {
  pipelinePreset?: PipelineStagePreset[]
}

export interface TenantSettingsRow {
  business?: SettingsBusiness
  i18n?: SettingsI18n
  billing?: SettingsBilling
  industry?: SettingsIndustry
  onboarding?: OnboardingStatus
}
