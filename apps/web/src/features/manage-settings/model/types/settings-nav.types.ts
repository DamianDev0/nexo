export type SettingsGroupKey = 'personal' | 'account' | 'workspace'

export type SettingsSectionKey =
  | 'profile'
  | 'notifications'
  | 'company'
  | 'team'
  | 'appearance'
  | 'navigation'
  | 'nomenclature'
  | 'fields'
  | 'pipelines'
  | 'activities'
  | 'contacts'

export interface SettingsChild {
  readonly key: string
  readonly href: string
}

export interface SettingsSection {
  readonly key: SettingsSectionKey
  readonly href: string
  readonly available: boolean
  readonly children?: ReadonlyArray<SettingsChild>
}

export interface SettingsGroup {
  readonly key: SettingsGroupKey
  readonly sections: ReadonlyArray<SettingsSection>
}
