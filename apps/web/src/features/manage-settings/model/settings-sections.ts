import { ROUTES } from '@/shared/config/routes'

export type SettingsSectionKey = 'general' | 'appearance' | 'navigation' | 'nomenclature'

export const SETTINGS_SECTIONS: ReadonlyArray<{ key: SettingsSectionKey; href: string }> = [
  { key: 'general', href: ROUTES.app.settings.general },
  { key: 'appearance', href: ROUTES.app.settings.appearance },
  { key: 'navigation', href: ROUTES.app.settings.navigation },
  { key: 'nomenclature', href: ROUTES.app.settings.nomenclature },
]
