'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { indicatorSpring, useReducedTransition } from '@/shared/lib/animations'
import { cn } from '@/shared/lib/cn'

import { SETTINGS_GROUPS } from '../config/settings-sections'

export function SettingsNav() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const underlineTransition = useReducedTransition(indicatorSpring)

  return (
    <nav className="flex flex-col gap-5">
      {SETTINGS_GROUPS.map((group) => (
        <div key={group.key}>
          <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t(`settings.groups.${group.key}`)}
          </p>
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {group.sections.map(({ key, href, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <li key={key}>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors duration-200',
                      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="relative py-0.5">
                      {t(`settings.sections.${key}`)}
                      {isActive && (
                        <motion.span
                          layoutId="settings-nav-underline"
                          transition={underlineTransition}
                          className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
                        />
                      )}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
