'use client'

import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  Package,
  CalendarCheck,
  BarChart3,
  Settings2,
} from 'lucide-react'
import type { ComponentProps } from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { ROUTES } from '@/constants/routes.constants'
import { useAuthStore } from '@/store/auth.store'

import { NavMain } from './NavMain'
import { NavUser } from './NavUser'
import { TeamSwitcher } from './TeamSwitcher'

const NAV_CRM = [
  { title: 'Dashboard', url: ROUTES.app.dashboard, icon: LayoutDashboard },
  { title: 'Contacts', url: ROUTES.app.contacts.list, icon: Users },
  { title: 'Companies', url: ROUTES.app.companies.list, icon: Building2 },
  { title: 'Deals', url: ROUTES.app.deals.list, icon: Handshake },
  { title: 'Products', url: ROUTES.app.products.list, icon: Package },
  { title: 'Activities', url: ROUTES.app.activities, icon: CalendarCheck },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Settings', url: ROUTES.app.settings.general, icon: Settings2 },
]

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user)

  const userData = {
    name: user?.email?.split('@')[0] ?? 'User',
    email: user?.email ?? '',
    avatar: '',
  }

  const teams = [{ name: 'NexoCRM', logo: LayoutDashboard, plan: 'Free' }]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NAV_CRM} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
