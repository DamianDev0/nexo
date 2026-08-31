'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { useModuleLabels } from '@/entities/nomenclature'
import { expandCollapse, smoothEase, useReducedTransition } from '@/shared/lib/animations'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import { SettingsNavRow } from './SettingsNavRow'

import type { SettingsSection } from '../../model/types'

interface SettingsNavItemProps {
  readonly section: SettingsSection
  readonly pathname: string
  readonly isActive: boolean
}

export function SettingsNavItem({ section, pathname, isActive }: Readonly<SettingsNavItemProps>) {
  const { t } = useTranslation()
  const moduleLabel = useModuleLabels()
  const submenuTransition = useReducedTransition(smoothEase)
  const { key, href, available, children } = section
  const label = moduleLabel(key, `settings.sections.${key}`)

  if (!available) {
    return (
      <li>
        <HintTooltip asChild hint={t('settings.comingSoon')} side="right">
          <span className="flex cursor-not-allowed items-center px-2.5 py-1.5 text-sm text-muted-foreground/50">
            {label}
          </span>
        </HintTooltip>
      </li>
    )
  }

  return (
    <li>
      <SettingsNavRow label={label} href={href} isActive={isActive} hasChildren={Boolean(children)} />

      <AnimatePresence initial={false}>
        {isActive && children && (
          <motion.ul
            variants={expandCollapse}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={submenuTransition}
            className="ml-4.5 mt-0.5 flex flex-col gap-0.5 overflow-hidden border-l border-border"
          >
            {children.map((child) => (
              <li key={child.key}>
                <SettingsNavRow
                  label={t(`settings.children.${key}.${child.key}`)}
                  href={child.href}
                  isActive={pathname === child.href}
                />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}
