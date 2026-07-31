'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/shadcn/tooltip'

import { SettingsNavRow } from './SettingsNavRow'

import type { SettingsSection } from '../../model/types'

interface SettingsNavItemProps {
  readonly section: SettingsSection
  readonly pathname: string
  readonly isActive: boolean
}

export function SettingsNavItem({ section, pathname, isActive }: Readonly<SettingsNavItemProps>) {
  const { t } = useTranslation()
  const { key, href, icon: Icon, available, children } = section
  const label = t(`settings.sections.${key}`)

  if (!available) {
    return (
      <li>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-1.5 text-sm',
                'cursor-not-allowed text-muted-foreground/50',
              )}
            >
              <Icon className="size-4 shrink-0 text-muted-foreground/50" />
              {label}
            </span>
          </TooltipTrigger>
          <TooltipContent side="right">{t('settings.comingSoon')}</TooltipContent>
        </Tooltip>
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

      {isActive && children && (
        <ul className="mt-0.5 flex flex-col gap-0.5">
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
