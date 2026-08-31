import { moduleIcon } from '@/features/setup-workspace'
import { ROUTES } from '@/shared/config/routes'

import type { NavItem, SidebarModuleKey } from '../model/types'

function navItem(key: SidebarModuleKey, url: string, basePath: string = url): NavItem {
  return {
    key,
    titleKey: `nav.${key}`,
    url,
    basePath,
    icon: moduleIcon(key),
  }
}

export const NAV_CRM: ReadonlyArray<NavItem> = [
  navItem('dashboard', ROUTES.app.dashboard),
  navItem('contacts', ROUTES.app.contacts.list),
  navItem('companies', ROUTES.app.companies.list),
  navItem('deals', ROUTES.app.deals.list),
  navItem('activities', ROUTES.app.activities),
  navItem('invoices', ROUTES.app.invoices.list),
  navItem('products', ROUTES.app.products.list),
  navItem('reports', ROUTES.app.reports),
  navItem('settings', ROUTES.app.settings.company, ROUTES.app.settings.root),
]

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return pathname === item.basePath || pathname.startsWith(`${item.basePath}/`)
}

export function navItemForPath(pathname: string): NavItem | undefined {
  return NAV_CRM.find((item) => isNavItemActive(item, pathname))
}
