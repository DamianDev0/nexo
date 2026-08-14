import { ROUTES } from '@/shared/config/routes'

const SECTION_SETTINGS: ReadonlyArray<readonly [prefix: string, href: string]> = [
  [ROUTES.app.contacts.list, ROUTES.app.settings.contacts.status],
  [ROUTES.app.companies.list, ROUTES.app.settings.company],
  [ROUTES.app.deals.list, ROUTES.app.settings.pipelines],
]

export function settingsPathFor(pathname: string): string {
  const match = SECTION_SETTINGS.find(([prefix]) => pathname.startsWith(prefix))
  return match?.[1] ?? ROUTES.app.settings.company
}
