import {
  BarChart3,
  Building2,
  CalendarCheck,
  Handshake,
  LayoutDashboard,
  Package,
  Settings2,
  Users,
} from 'lucide-react'

import { ROUTES } from '@/shared/config/routes'

import type { DEFAULT_SIDEBAR_MODULE_KEYS } from '@repo/shared-types'
import type { LucideIcon } from 'lucide-react'

export type SidebarModuleKey = (typeof DEFAULT_SIDEBAR_MODULE_KEYS)[number]

export interface NavItem {
  readonly titleKey: `nav.${SidebarModuleKey}`
  readonly url: string
  readonly icon: LucideIcon
}

export const NAV_CRM: ReadonlyArray<NavItem> = [
  { titleKey: 'nav.dashboard', url: ROUTES.app.dashboard, icon: LayoutDashboard },
  { titleKey: 'nav.contacts', url: ROUTES.app.contacts.list, icon: Users },
  { titleKey: 'nav.companies', url: ROUTES.app.companies.list, icon: Building2 },
  { titleKey: 'nav.deals', url: ROUTES.app.deals.list, icon: Handshake },
  { titleKey: 'nav.products', url: ROUTES.app.products.list, icon: Package },
  { titleKey: 'nav.activities', url: ROUTES.app.activities, icon: CalendarCheck },
  { titleKey: 'nav.reports', url: ROUTES.app.reports, icon: BarChart3 },
  { titleKey: 'nav.settings', url: ROUTES.app.settings.general, icon: Settings2 },
]

export const DEFAULT_TEAMS = [{ name: 'NexoCRM', logo: LayoutDashboard, plan: 'Free' }] as const
