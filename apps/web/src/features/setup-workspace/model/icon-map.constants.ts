import {
  Home,
  Users,
  Building2,
  Briefcase,
  Calendar,
  FileText,
  Package,
  BarChart3,
  Settings,
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
  home: Home,
  users: Users,
  building: Building2,
  briefcase: Briefcase,
  calendar: Calendar,
  'file-text': FileText,
  package: Package,
  'bar-chart': BarChart3,
  settings: Settings,
}
