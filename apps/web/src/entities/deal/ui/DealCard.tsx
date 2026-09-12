'use client'

import { DealStatus } from '@repo/shared-types'
import { formatDateCO } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import { Amount } from '@/shared/ui/atoms/amount'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { Text } from '@/shared/ui/atoms/text'
import { CalendarBlankIcon } from '@/shared/ui/icons'
import { RecordCard } from '@/shared/ui/molecules/record-card'

import { dealStatusTone, isDealOpen } from '../lib/deal-display'

import type { DealListItem } from '@repo/shared-types'

type DealCardProps = {
  readonly deal: DealListItem
}

export function DealCard({ deal }: Readonly<DealCardProps>) {
  const { t } = useTranslation()
  return (
    <RecordCard>
      <RecordCard.Header>
        <BadgeSoft tone={dealStatusTone(deal.status)} size="sm">
          {t(`deals.status.${deal.status}`)}
        </BadgeSoft>
        <Text variant="fine" className="min-w-0 truncate">
          {deal.stageName ?? t('deals.noStage')}
        </Text>
        <RecordCard.Aside>
          <Amount cents={deal.valueCents} currency={deal.currency} className="font-bold" />
        </RecordCard.Aside>
      </RecordCard.Header>

      <RecordCard.Title muted={deal.status === DealStatus.LOST}>{deal.title}</RecordCard.Title>

      {deal.expectedCloseDate ? (
        <RecordCard.Meta icon={<CalendarBlankIcon aria-hidden />}>
          {t('deals.closes', { when: formatDateCO(deal.expectedCloseDate) })}
        </RecordCard.Meta>
      ) : null}

      {isDealOpen(deal) && deal.nextStep ? <Text variant="hint">{deal.nextStep}</Text> : null}
    </RecordCard>
  )
}
