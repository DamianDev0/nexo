'use client'

import { useAuthStore } from '@/entities/session'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/shared/ui/shadcn/sidebar'

import { DEFAULT_TEAMS, NAV_CRM } from '../model/nav-items'

import { NavMain } from './NavMain'
import { NavUser } from './NavUser'
import { TeamSwitcher } from './TeamSwitcher'

import type { AuthenticatedUser } from '@repo/shared-types'
import type { ComponentProps } from 'react'

function toUserDisplay(user: AuthenticatedUser | null) {
  return {
    name: user?.email?.split('@')[0] ?? 'User',
    email: user?.email ?? '',
    avatar: '',
  }
}

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={[...DEFAULT_TEAMS]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NAV_CRM} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={toUserDisplay(user)} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
