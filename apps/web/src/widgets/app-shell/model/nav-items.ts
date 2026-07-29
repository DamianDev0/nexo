import {
  Boxes,
  Building2,
  CalendarClock,
  ChartNoAxesColumn,
  Handshake,
  LayoutDashboard,
  ReceiptText,
  Settings2,
  UsersRound,
} from 'lucide-react'

import { ROUTES } from '@/shared/config/routes'

import type { DEFAULT_SIDEBAR_MODULE_KEYS } from '@repo/shared-types'
import type { LucideIcon } from 'lucide-react'

export type SidebarModuleKey = (typeof DEFAULT_SIDEBAR_MODULE_KEYS)[number]

export interface NavItem {
  readonly key: SidebarModuleKey
  readonly titleKey: `nav.${SidebarModuleKey}`
  readonly url: string
  readonly icon: LucideIcon
  readonly available: boolean
}

const BUILT_ROUTES: ReadonlySet<string> = new Set([
  ROUTES.app.dashboard,
  ROUTES.app.contacts.list,
  ROUTES.app.settings.general,
])

function navItem(key: SidebarModuleKey, url: string, icon: LucideIcon): NavItem {
  return { key, titleKey: `nav.${key}`, url, icon, available: BUILT_ROUTES.has(url) }
}

export const NAV_CRM: ReadonlyArray<NavItem> = [
  navItem('dashboard', ROUTES.app.dashboard, LayoutDashboard),
  navItem('contacts', ROUTES.app.contacts.list, UsersRound),
  navItem('companies', ROUTES.app.companies.list, Building2),
  navItem('deals', ROUTES.app.deals.list, Handshake),
  navItem('activities', ROUTES.app.activities, CalendarClock),
  navItem('invoices', ROUTES.app.invoices.list, ReceiptText),
  navItem('products', ROUTES.app.products.list, Boxes),
  navItem('reports', ROUTES.app.reports, ChartNoAxesColumn),
  navItem('settings', ROUTES.app.settings.general, Settings2),
]

export function navItemForPath(pathname: string): NavItem | undefined {
  return NAV_CRM.find((item) => pathname === item.url || pathname.startsWith(`${item.url}/`))
}

export const DEFAULT_TEAMS = [{ name: 'NexoCRM', logo: LayoutDashboard, plan: 'Free' }] as const
