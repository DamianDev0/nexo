'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { useModuleLabels } from '@/entities/nomenclature'
import { indicatorSpring, useReducedTransition } from '@/shared/lib/animations'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/shadcn/sidebar'

import { isNavItemActive } from '../lib/nav-items'

import type { NavItem } from '../model/types'
import type { SidebarNavGroup } from '../query/useSidebarModules'

const BUTTON_CLASSES =
  'h-9 gap-2.5 rounded-sm text-[13px] [&_svg]:size-4.5 [&_svg]:shrink-0 [&_svg]:text-faint hover:bg-transparent hover:text-foreground hover:[&_svg]:text-primary-deep active:bg-transparent dark:hover:[&_svg]:text-primary'

function NavEntry({ item }: Readonly<{ item: NavItem }>) {
  const { t } = useTranslation()
  const moduleLabel = useModuleLabels()
  const pathname = usePathname()
  const isActive = isNavItemActive(item, pathname)
  const pillTransition = useReducedTransition(indicatorSpring)
  const title = moduleLabel(item.key, item.titleKey)

  return (
    <SidebarMenuItem data-nav-key={item.key}>
      {item.available ? (
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={title}
          className={`${BUTTON_CLASSES} relative isolate transition-colors duration-150 data-[active=true]:bg-transparent data-[active=true]:font-semibold data-[active=true]:text-foreground data-[active=true]:[&_svg]:text-primary-deep dark:data-[active=true]:[&_svg]:text-primary`}
        >
          <Link href={item.url}>
            {isActive && (
              <motion.span
                layoutId="sidebar-active-rail"
                transition={pillTransition}
                className="absolute -left-2 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
              />
            )}
            <motion.span
              animate={{ scale: isActive ? 1.08 : 1 }}
              transition={pillTransition}
              className="flex shrink-0 items-center"
            >
              <item.icon />
            </motion.span>
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
