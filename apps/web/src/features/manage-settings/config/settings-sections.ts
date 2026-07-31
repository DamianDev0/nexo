import { ROUTES } from '@/shared/config/routes'
import { GearIcon, PaletteIcon, SidebarSimpleIcon, TextAaIcon } from '@/shared/ui/icons'

import type { AppIcon } from '@/shared/ui/icons'

export type SettingsSectionKey = 'general' | 'appearance' | 'navigation' | 'nomenclature'

export interface SettingsSection {
  readonly key: SettingsSectionKey
  readonly href: string
  readonly icon: AppIcon
}

export const SETTINGS_SECTIONS: ReadonlyArray<SettingsSection> = [
  { key: 'general', href: ROUTES.app.settings.general, icon: GearIcon },
  { key: 'appearance', href: ROUTES.app.settings.appearance, icon: PaletteIcon },
  { key: 'navigation', href: ROUTES.app.settings.navigation, icon: SidebarSimpleIcon },
  { key: 'nomenclature', href: ROUTES.app.settings.nomenclature, icon: TextAaIcon },
]

export const SETTINGS_GROUPS: ReadonlyArray<{
  key: string
  sections: ReadonlyArray<SettingsSection>
}> = [{ key: 'workspace', sections: SETTINGS_SECTIONS }]

export function sectionKeyForPath(pathname: string): SettingsSectionKey {
  return SETTINGS_SECTIONS.find((section) => section.href === pathname)?.key ?? 'general'
}
