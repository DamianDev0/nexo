'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'

import { TAB_ICONS, TAB_ORDER } from '../config/dock-tabs.constants'

import type { DockTab } from '../model/types/call.types'

type DockTabBarProps = {
  readonly active: DockTab
  readonly onSelect: (tab: DockTab) => void
}

export function DockTabBar({ active, onSelect }: Readonly<DockTabBarProps>) {
  const { t } = useTranslation()
  return (
    <nav className="grid shrink-0 grid-cols-3 border-t border-border">
      {TAB_ORDER.map((tab) => {
        const Icon = TAB_ICONS[tab]
        const current = tab === active
        return (
          <PillButton
            key={tab}
            variant="ghost"
            size="sm"
            aria-current={current}
            onClick={() => onSelect(tab)}
            className={cn(
              'h-13 flex-col gap-0.5 rounded-none',
              current ? 'text-primary-deep dark:text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="size-4.5" />
            <Text variant="micro" className="font-medium text-inherit">
              {t(`dialer.tabs.${tab}`)}
            </Text>
          </PillButton>
        )
      })}
    </nav>
  )
}
