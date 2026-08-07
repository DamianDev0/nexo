'use client'

import { useTranslation } from 'react-i18next'

import { useLogout } from '@/features/logout'
import { Avatar } from '@/shared/ui/atoms/avatar'
import { AvatarGradient } from '@/shared/ui/atoms/avatar-gradient'
import { BellIcon, CaretUpDownIcon, GearIcon, SignOutIcon } from '@/shared/ui/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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

import type { SidebarUser } from '../model/types'

function UserIdentity({ user }: Readonly<{ user: SidebarUser }>) {
  return (
    <>
      <Avatar size="sm" variant="soft">
        {user.avatarUrl && <Avatar.Image src={user.avatarUrl} alt={user.name} />}
        <Avatar.Fallback aria-label={user.name} className="bg-transparent dark:bg-transparent">
          <AvatarGradient seed={user.email} />
        </Avatar.Fallback>
      </Avatar>
      <div className="grid flex-1 text-left leading-tight">
        <span className="truncate text-sm font-bold tracking-[-0.01em] text-foreground">
          {user.name}
        </span>
        <span className="truncate text-[11px] text-muted-foreground">{user.email}</span>
      </div>
    </>
  )
}

export function NavUser({ user }: Readonly<{ user: SidebarUser }>) {
  const { t } = useTranslation()
  const { isMobile } = useSidebar()
  const { mutate: logout } = useLogout()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-13 gap-2.5 rounded-md transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground data-[state=open]:bg-sidebar-hover data-[state=open]:text-sidebar-foreground"
            >
              <UserIdentity user={user} />
              <CaretUpDownIcon className="ml-auto size-4 text-faint" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-1 py-1.5 text-left">
                <UserIdentity user={user} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <GearIcon />
                {t('nav.settings')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                {t('nav.notifications')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <SignOutIcon />
              {t('nav.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
