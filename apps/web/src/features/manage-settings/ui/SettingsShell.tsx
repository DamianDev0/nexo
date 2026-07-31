'use client'

import { motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { quickEase, useReducedTransition } from '@/shared/lib/animations'
import { useScrollTopOnChange } from '@/shared/lib/hooks/useScrollTopOnChange'

import { sectionKeyForPath } from '../config/settings-sections'
import { useManageSettings } from '../model/settings-context'

import { SaveBar } from './SaveBar'
import { SettingsNav } from './SettingsNav'

import type { SettingsSectionKey } from '../config/settings-sections'
import type { SettingsSectionController } from '../model/settings-context'
import type { ReactNode } from 'react'

export function SettingsShell({ children }: Readonly<{ children: ReactNode }>) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentTransition = useReducedTransition(quickEase)
  const { company, appearance, navigation, nomenclature } = useManageSettings()

  useScrollTopOnChange(pathname, scrollRef)

  const controllers: Record<SettingsSectionKey, SettingsSectionController> = {
    general: company,
    appearance,
    navigation,
    nomenclature,
  }
  const active = controllers[sectionKeyForPath(pathname)]

  return (
    <div className="flex h-full">
      <aside className="w-52 shrink-0 overflow-y-auto border-r border-border px-3 py-6">
        <SettingsNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
          <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>

          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={contentTransition}
            className="mt-6"
          >
            {children}
          </motion.div>
        </div>

        <SaveBar
          onSave={active.handleSave}
          onReset={active.handleReset}
          isDirty={active.isDirty}
          isPending={active.isPending}
        />
      </div>
    </div>
  )
}
