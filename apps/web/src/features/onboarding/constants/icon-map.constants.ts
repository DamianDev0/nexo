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
import type { LucideIcon } from 'lucide-react'

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
