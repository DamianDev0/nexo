'use client'

import { useAuth } from '@/entities/session'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/shared/ui/shadcn/sidebar'

import { toSidebarTeam, toSidebarUser } from '../lib/sidebar-identity'
import { useSidebarModules } from '../query/useSidebarModules'
import { useTenantBranding } from '../query/useTenantBranding'

import { NavMain } from './NavMain'
import { NavUser } from './NavUser'
import { SidebarCollapseButton } from './SidebarCollapseButton'
import { TeamSwitcher } from './TeamSwitcher'

import type { ComponentProps } from 'react'

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const { data: user } = useAuth()
  const groups = useSidebarModules()
  const branding = useTenantBranding()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher team={toSidebarTeam(branding)} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={groups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={toSidebarUser(user ?? null)} />
      </SidebarFooter>
      <SidebarCollapseButton />
    </Sidebar>
  )
}
