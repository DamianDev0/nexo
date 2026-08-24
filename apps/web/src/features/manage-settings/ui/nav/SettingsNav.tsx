'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { ROUTES } from '@/shared/config/routes'
import { CaretLeftIcon } from '@/shared/ui/icons'

import { SETTINGS_GROUPS } from '../../config/settings-nav.constants'
import { isSectionActive } from '../../lib/settings-nav'

import { SettingsNavItem } from './SettingsNavItem'

export function SettingsNav() {
  const { t } = useTranslation()
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-6">
      <Link
        href={ROUTES.app.dashboard}
        className="flex items-center gap-1 px-2.5 text-sm text-primary-deep transition-colors duration-200 hover:text-primary-deep/80 dark:text-primary dark:hover:text-primary/80"
      >
        <CaretLeftIcon className="size-3.5" />
        {t('settings.back')}
      </Link>

      {SETTINGS_GROUPS.map((group) => (
        <div key={group.key}>
          <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t(`settings.groups.${group.key}`)}
          </p>
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
