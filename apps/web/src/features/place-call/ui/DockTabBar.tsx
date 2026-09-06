'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'

import { DISABLED_SCREENS, SCREEN_ICONS, SCREEN_ORDER } from '../config/dock-tabs.constants'

import type { DockScreen } from '../model/types/call.types'

type DockTabBarProps = {
  readonly active: DockScreen
  readonly onSelect: (screen: DockScreen) => void
}

export function DockTabBar({ active, onSelect }: Readonly<DockTabBarProps>) {
  const { t } = useTranslation()
  return (
    <nav className="grid h-16 shrink-0 grid-cols-5 gap-0.5 border-t border-border px-1.5">
      {SCREEN_ORDER.map((screen) => {
        const Icon = SCREEN_ICONS[screen]
        const current = screen === active
        return (
          <PillButton
            key={screen}
            variant="ghost"
            size="sm"
            aria-current={current}
            disabled={DISABLED_SCREENS.includes(screen)}
            onClick={() => onSelect(screen)}
            className={cn(
              'my-2 h-auto flex-col items-center justify-center gap-1 rounded-lg px-1',
              current
                ? 'bg-accent text-primary-deep hover:bg-accent dark:text-primary'
                : 'text-body hover:bg-muted',
            )}
          >
            <Icon className="size-4.5" />
            <Text className="text-[10px] font-medium text-inherit">
              {t(`dialer.tabs.${screen}`)}
            </Text>
          </PillButton>
        )
      })}
    </nav>
  )
}
