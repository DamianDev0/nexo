'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/shadcn/sidebar'

import type { NavItem } from '../model/nav-items'

interface NavMainProps {
  readonly items: ReadonlyArray<NavItem>
}

export function NavMain({ items }: NavMainProps) {
  const { t } = useTranslation()
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('nav.platform')}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)
          const title = t(item.titleKey)
          return (
            <SidebarMenuItem key={item.titleKey}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={title}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
