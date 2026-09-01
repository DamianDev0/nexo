'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { ROUTES } from '@/shared/config/routes'
import { Text } from '@/shared/ui/atoms/text'
import { CaretLeftIcon } from '@/shared/ui/icons'
import { SearchInput } from '@/shared/ui/molecules/search-input'

import { isSectionActive } from '../../lib/settings-nav'
import { useSettingsNavSearch } from '../../model/useSettingsNavSearch'

import { SettingsNavItem } from './SettingsNavItem'

export function SettingsNav() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const { query, setQuery, groups } = useSettingsNavSearch()

  return (
    <nav className="flex flex-col gap-6">
      <Link
        href={ROUTES.app.dashboard}
        className="flex items-center gap-1 px-2.5 text-sm text-primary-deep transition-colors duration-200 hover:text-primary-deep/80 dark:text-primary dark:hover:text-primary/80"
      >
        <CaretLeftIcon className="size-3.5" />
        {t('settings.back')}
      </Link>

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={t('settings.searchPlaceholder')}
        clear={{ onClick: () => setQuery(''), label: t('common.clear') }}
        classes={{
          icon: 'size-3.5 text-faint transition-colors group-focus-within:text-muted-foreground',
          input:
            'h-8 border-transparent bg-muted/50 pl-8 pr-7 text-sm shadow-none hover:bg-muted/80 focus-visible:border-border focus-visible:bg-background focus-visible:ring-0 dark:bg-muted/30 dark:focus-visible:bg-input/30',
        }}
      />

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
