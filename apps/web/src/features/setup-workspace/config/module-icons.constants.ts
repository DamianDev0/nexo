import {
  BuildingsIcon,
  CalendarCheckIcon,
  ChartBarIcon,
  GearIcon,
  HandshakeIcon,
  InvoiceIcon,
  PackageIcon,
  SquaresFourIcon,
  UsersThreeIcon,
} from '@/shared/ui/icons'

import type { SidebarModuleKey } from '../model/types'
import type { AppIcon } from '@/shared/ui/icons'

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

export const SIDEBAR_ICON_MAP: Record<string, AppIcon> = {
  home: SquaresFourIcon,
  users: UsersThreeIcon,
  building: BuildingsIcon,
  briefcase: HandshakeIcon,
  calendar: CalendarCheckIcon,
  'file-text': InvoiceIcon,
  package: PackageIcon,
  'bar-chart': ChartBarIcon,
  settings: GearIcon,
}
