'use client'

import { useTranslation } from 'react-i18next'

import { useModuleLabels } from '@/entities/nomenclature'
import { cn } from '@/shared/lib/cn'
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
  const { key, href, icon: Icon, available, children } = section
  const label = moduleLabel(key, `settings.sections.${key}`)

  if (!available) {
    return (
      <li>
        <HintTooltip asChild hint={t('settings.comingSoon')} side="right">
          <span
            role="link"
            aria-disabled="true"
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-1.5 text-sm',
              'cursor-not-allowed text-faint',
            )}
          >
            <Icon className="size-4 shrink-0 text-faint" />
            {label}
          </span>
        </HintTooltip>
      </li>
    )
  }

  return (
    <li>
      <SettingsNavRow
        label={label}
        href={href}
        icon={Icon}
        isActive={isActive}
        hasChildren={Boolean(children)}
      />

      {children && (
        <ul className="ml-6 mt-0.5 flex flex-col gap-0.5">
          {children.map((child) => (
            <li key={child.key}>
              <SettingsNavRow
                label={t(`settings.children.${key}.${child.key}`)}
                href={child.href}
                isActive={pathname === child.href}
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
