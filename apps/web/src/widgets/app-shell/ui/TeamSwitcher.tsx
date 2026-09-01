'use client'

import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { CaretUpDownIcon, PlusIcon } from '@/shared/ui/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/ui/shadcn/sidebar'

import { teamInitial } from '../lib/sidebar-identity'

import type { SidebarTeam } from '../model/types'

export function TeamSwitcher({ team }: Readonly<{ team: SidebarTeam }>) {
  const { t } = useTranslation()
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-13 rounded-md px-2.5 transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground data-[state=open]:bg-sidebar-hover data-[state=open]:text-sidebar-foreground"
            >
              <span className="hidden size-8 shrink-0 items-center justify-center rounded-md bg-primary-pale text-sm font-black text-primary-deep group-data-[collapsible=icon]:flex">
                {teamInitial(team.name)}
              </span>
              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <Text variant="bold" className="truncate text-base font-black tracking-[-0.02em]">
                  {team.name}
                </Text>
                <Text variant="hint" className="truncate font-medium">
                  {team.plan}
                </Text>
              </div>
              <CaretUpDownIcon className="ml-auto size-4 text-faint group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs font-semibold text-body">
              {t('nav.teams')}
            </DropdownMenuLabel>
            <DropdownMenuItem className="gap-2 p-2">
              <span className="truncate font-medium">{team.name}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <PlusIcon className="size-4" />
              <Text variant="muted" className="font-medium">
                {t('nav.addTeam')}
              </Text>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
