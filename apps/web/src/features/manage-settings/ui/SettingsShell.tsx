'use client'

import { motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useModuleLabels } from '@/entities/nomenclature'
import { quickEase, useReducedTransition } from '@/shared/lib/animations'
import { cn } from '@/shared/lib/cn'
import { useScrollTopOnChange } from '@/shared/lib/hooks/useScrollTopOnChange'
import { Text } from '@/shared/ui/atoms/text'
import { SectionTabs } from '@/shared/ui/molecules/section-tabs'

import { buildMobileNavTabs, buildSectionTabs, findSection } from '../lib/settings-nav'
import { useSectionController } from '../model/useSectionController'

import { SettingsNav } from './nav/SettingsNav'
import { SaveBar } from './SaveBar'

import type { ReactNode } from 'react'

export function SettingsShell({ children }: Readonly<{ children: ReactNode }>) {
  const { t } = useTranslation()
  const moduleLabel = useModuleLabels()
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentTransition = useReducedTransition(quickEase)

  useScrollTopOnChange(pathname, scrollRef)

  const section = useMemo(() => findSection(pathname), [pathname])
  const tabs = useMemo(() => buildSectionTabs(section, t), [section, t])
  const mobileTabs = useMemo(() => buildMobileNavTabs(moduleLabel), [moduleLabel])
  const controller = useSectionController(section?.key)

  return (
    <div className="flex h-full">
      <aside className="scrollbar-hidden hidden w-56 shrink-0 overflow-y-auto border-r border-border px-3 py-6 lg:block">
        <SettingsNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <SectionTabs
          tabs={mobileTabs}
          active={section?.href ?? ''}
          className="scrollbar-hidden shrink-0 overflow-x-auto px-2 lg:hidden"
        />

        <header
          className={cn('shrink-0 px-4 pt-6 lg:px-8', tabs.length > 0 && 'border-b border-border')}
        >
          <h1 className="text-lg font-black tracking-[-0.02em] text-foreground">
            {section
              ? moduleLabel(section.key, `settings.sections.${section.key}`)
              : t('settings.title')}
          </h1>
          <Text as="p" variant="muted" className="mt-1">
            {t('settings.subtitle')}
          </Text>
          {tabs.length > 0 && (
            <SectionTabs
              tabs={tabs}
              active={pathname}
              className="scrollbar-hidden mt-4 overflow-x-auto border-b-0"
            />
          )}
        </header>

        <div
          ref={scrollRef}
          className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-8"
        >
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={contentTransition}
          >
            {children}
          </motion.div>
        </div>

        {controller && (
          <SaveBar
            onSave={controller.handleSave}
            onReset={controller.handleReset}
            isDirty={controller.isDirty}
            isPending={controller.isPending}
          />
        )}
      </div>
    </div>
  )
}
