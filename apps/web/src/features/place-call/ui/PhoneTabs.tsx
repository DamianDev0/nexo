'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'

import { PHONE_TABS } from '../config/dock-tabs.constants'

import type { PhoneTab } from '../model/types/call.types'

type PhoneTabsProps = {
  readonly active: PhoneTab
  readonly onSelect: (tab: PhoneTab) => void
}

export function PhoneTabs({ active, onSelect }: Readonly<PhoneTabsProps>) {
  const { t } = useTranslation()
  return (
    <div className="flex shrink-0 items-end gap-5 border-b border-border px-4">
      {PHONE_TABS.map((tab) => {
        const current = tab === active
        return (
          <PillButton
            key={tab}
            variant="ghost"
            size="sm"
            aria-current={current}
            onClick={() => onSelect(tab)}
            className={cn(
              'h-9 rounded-none border-b-2 px-0.5 text-sm hover:bg-transparent',
              current
                ? 'border-primary font-medium text-primary-deep dark:text-primary'
                : 'border-transparent font-normal text-muted-foreground hover:text-foreground',
            )}
          >
            {t(`dialer.tabs.${tab}`)}
          </PillButton>
        )
      })}
    </div>
  )
}
