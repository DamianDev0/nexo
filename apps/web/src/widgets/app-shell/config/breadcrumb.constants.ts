import { ROUTES } from '@/shared/config/routes'

export const SETTINGS_SECTION_ROUTE: Readonly<Record<string, string>> = {
  profile: ROUTES.app.settings.profile,
  notifications: ROUTES.app.settings.notifications,
  company: ROUTES.app.settings.company,
  team: ROUTES.app.settings.team,
  appearance: ROUTES.app.settings.appearance.brand,
  navigation: ROUTES.app.settings.navigation,
  nomenclature: ROUTES.app.settings.nomenclature,
  pipelines: ROUTES.app.settings.pipelines,
  contacts: ROUTES.app.settings.contacts.status,
}
