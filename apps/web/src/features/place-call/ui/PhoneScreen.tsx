'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { GearIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import { PhoneTabs } from './PhoneTabs'

import type { PhoneTab } from '../model/types/call.types'
import type { ReactNode } from 'react'

type PhoneScreenProps = {
  readonly activeTab: PhoneTab
  readonly onSelectTab: (tab: PhoneTab) => void
  readonly children: ReactNode
}

export function PhoneScreen({ activeTab, onSelectTab, children }: Readonly<PhoneScreenProps>) {
  const { t } = useTranslation()
  return (
    <>
      <div className="flex shrink-0 items-center justify-between px-4 pt-2.5 pb-1">
        <Text className="text-sm font-bold">{t('dialer.title')}</Text>
        <HintTooltip asChild hint={t('dialer.comingSoon')}>
          <span>
            <PillButton
              variant="ghost"
              size="xs"
              aria-label={t('dialer.settings')}
              disabled
              className="w-8 px-0"
            >
              <GearIcon className="size-4" />
            </PillButton>
          </span>
        </HintTooltip>
      </div>
      <PhoneTabs active={activeTab} onSelect={onSelectTab} />
      {children}
    </>
  )
}
