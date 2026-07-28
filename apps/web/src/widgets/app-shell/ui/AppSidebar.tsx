'use client'

import { useAuthStore } from '@/entities/session'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/shared/ui/shadcn/sidebar'

import { DEFAULT_TEAMS } from '../model/nav-items'
import { useSidebarModules } from '../model/useSidebarModules'

import { NavMain } from './NavMain'
import { NavUser } from './NavUser'
import { SidebarCollapseButton } from './SidebarCollapseButton'
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
  const groups = useSidebarModules()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={[...DEFAULT_TEAMS]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={groups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={toUserDisplay(user)} />
      </SidebarFooter>
      <SidebarCollapseButton />
    </Sidebar>
  )
}
