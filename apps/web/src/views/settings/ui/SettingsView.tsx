'use client'

import {
  AppearanceSettings,
  GeneralSettings,
  NavigationSettings,
  NomenclatureSettings,
  type SettingsSectionKey,
} from '@/features/manage-settings'

const SECTION_CONTENT: Record<SettingsSectionKey, () => React.JSX.Element> = {
  general: GeneralSettings,
  appearance: AppearanceSettings,
  navigation: NavigationSettings,
  nomenclature: NomenclatureSettings,
}

export function SettingsView({ section }: Readonly<{ section: SettingsSectionKey }>) {
  const Section = SECTION_CONTENT[section]

  return <Section />
}
