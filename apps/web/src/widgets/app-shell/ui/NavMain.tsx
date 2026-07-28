'use client'

import { motion } from 'motion/react'
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
import type { SidebarNavGroup } from '../model/useSidebarModules'

const BUTTON_CLASSES = 'h-9 gap-2.5 rounded-lg [&>svg]:size-4.5'

function NavEntry({ item }: Readonly<{ item: NavItem }>) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)
  const title = t(item.titleKey)

  return (
    <SidebarMenuItem>
      {item.available ? (
        <SidebarMenuButton asChild isActive={isActive} tooltip={title} className={BUTTON_CLASSES}>
          <Link href={item.url}>
            <item.icon />
            <span>{title}</span>
          </Link>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton
          aria-disabled="true"
          tabIndex={-1}
          tooltip={`${title} — ${t('nav.comingSoon')}`}
          className={`${BUTTON_CLASSES} cursor-default opacity-45 aria-disabled:pointer-events-auto hover:bg-transparent active:bg-transparent`}
        >
          <item.icon />
          <span>{title}</span>
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  )
}

interface NavMainProps {
  readonly groups: ReadonlyArray<SidebarNavGroup>
}

export function NavMain({ groups }: Readonly<NavMainProps>) {
  const { t } = useTranslation()

  return (
    <>
      {groups.map((group, groupIndex) => (
        <motion.div
          key={group.key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: groupIndex * 0.06, ease: 'easeOut' }}
        >
          <SidebarGroup className="py-1">
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-wide group-data-[collapsible=icon]:pointer-events-none">
              {t(`nav.groups.${group.key}`)}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => (
                <NavEntry key={item.key} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </motion.div>
      ))}
    </>
  )
}
