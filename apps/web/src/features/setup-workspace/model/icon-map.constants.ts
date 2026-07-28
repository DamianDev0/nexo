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

import type { DEFAULT_SIDEBAR_MODULE_KEYS } from '@repo/shared-types'
import type { LucideIcon } from 'lucide-react'

export type SidebarModuleKey = (typeof DEFAULT_SIDEBAR_MODULE_KEYS)[number]

export const MODULE_ICON_NAMES: Record<SidebarModuleKey, string> = {
  dashboard: 'home',
  contacts: 'users',
  companies: 'building',
  deals: 'briefcase',
  activities: 'calendar',
  invoices: 'file-text',
  products: 'package',
  reports: 'bar-chart',
  settings: 'settings',
}

export const SIDEBAR_ICON_MAP: Record<string, LucideIcon> = {
  home: LayoutDashboard,
  users: UsersRound,
  building: Building2,
  briefcase: Handshake,
  calendar: CalendarClock,
  'file-text': ReceiptText,
  package: Boxes,
  'bar-chart': ChartNoAxesColumn,
  settings: Settings2,
}
