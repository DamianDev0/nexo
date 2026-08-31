'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useModuleLabels } from '@/entities/nomenclature'
import { ROUTES } from '@/shared/config/routes'
import { Text } from '@/shared/ui/atoms/text'
import { CaretLeftIcon, MagnifyingGlassIcon, XIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { SmoothInput } from '@/shared/ui/smoothui/input'

import { SETTINGS_GROUPS } from '../../config/settings-nav.constants'
import { filterSettingsGroups } from '../../lib/filter-settings-nav'
import { isSectionActive } from '../../lib/settings-nav'

import { SettingsNavItem } from './SettingsNavItem'

import type { SettingsNavLabels } from '../../lib/filter-settings-nav'

export function SettingsNav() {
  const { t } = useTranslation()
  const moduleLabel = useModuleLabels()
  const pathname = usePathname()
  const [query, setQuery] = useState('')

  const labels = useMemo<SettingsNavLabels>(
    () => ({
      section: (section) => moduleLabel(section.key, `settings.sections.${section.key}`),
      child: (sectionKey, childKey) => t(`settings.children.${sectionKey}.${childKey}`),
    }),
    [moduleLabel, t],
  )

  const groups = useMemo(
    () => filterSettingsGroups(SETTINGS_GROUPS, query, labels),
    [query, labels],
  )

  return (
    <nav className="flex flex-col gap-6">
      <Link
        href={ROUTES.app.dashboard}
        className="flex items-center gap-1 px-2.5 text-sm text-primary-deep transition-colors duration-200 hover:text-primary-deep/80 dark:text-primary dark:hover:text-primary/80"
      >
        <CaretLeftIcon className="size-3.5" />
        {t('settings.back')}
      </Link>

      <div className="group relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-faint transition-colors group-focus-within:text-muted-foreground" />
        <SmoothInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setQuery('')
          }}
          placeholder={t('settings.searchPlaceholder')}
          aria-label={t('settings.searchPlaceholder')}
          className="h-8 border-transparent bg-muted/50 pl-8 pr-7 text-sm shadow-none hover:bg-muted/80 focus-visible:border-border focus-visible:bg-background focus-visible:ring-0 dark:bg-muted/30 dark:focus-visible:bg-input/30"
        />
        {query.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQuery('')}
            aria-label={t('common.clear')}
            className="absolute right-1 top-1/2 z-10 size-6 -translate-y-1/2 text-muted-foreground"
          >
            <XIcon className="size-3" />
          </Button>
        )}
      </div>

      {groups.length === 0 && (
        <Text as="p" variant="muted" className="px-2.5">
          {t('settings.searchEmpty')}
        </Text>
      )}

      {groups.map((group) => (
        <div key={group.key}>
          <Text as="p" variant="caption" className="px-2.5 text-[10px] uppercase">
            {t(`settings.groups.${group.key}`)}
          </Text>
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {group.sections.map((section) => (
              <SettingsNavItem
                key={section.key}
                section={section}
                pathname={pathname}
                isActive={isSectionActive(section, pathname)}
              />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
