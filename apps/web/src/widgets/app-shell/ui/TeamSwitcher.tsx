'use client'

import { useTranslation } from 'react-i18next'

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
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-base font-black tracking-[-0.02em] text-foreground">
                  {team.name}
                </span>
                <span className="truncate text-[11px] font-medium text-muted-foreground">
                  {team.plan}
                </span>
              </div>
              <CaretUpDownIcon className="ml-auto size-4 text-faint" />
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
              <span className="font-medium text-muted-foreground">{t('nav.addTeam')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
