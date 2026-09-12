'use client'

import { useTranslation } from 'react-i18next'

import { Amount } from '@/shared/ui/atoms/amount'
import { Text } from '@/shared/ui/atoms/text'
import { RecordCard } from '@/shared/ui/molecules/record-card'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

import { openDealCount, openDealsValue } from '../lib/deal-display'

import { DealCard } from './DealCard'

import type { DealListItem } from '@repo/shared-types'

type DealCardListProps = {
  readonly deals: ReadonlyArray<DealListItem>
  readonly isLoading: boolean
}

export function DealCardList({ deals, isLoading }: Readonly<DealCardListProps>) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <Text variant="caption" className="uppercase">
          {t('deals.openCount', { count: openDealCount(deals) })}
        </Text>
        <Amount cents={openDealsValue(deals)} className="font-bold" />
      </div>
      <RecordCard.List>
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </RecordCard.List>
    </div>
  )
}
