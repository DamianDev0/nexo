import { DealStatus } from '@repo/shared-types'

import type { DealListItem } from '@repo/shared-types'

type DealLike = Pick<DealListItem, 'valueCents' | 'status'>

const STATUS_ORDER: Readonly<Record<DealStatus, number>> = {
  [DealStatus.OPEN]: 0,
  [DealStatus.ON_HOLD]: 1,
  [DealStatus.WON]: 2,
  [DealStatus.LOST]: 3,
}

export function isDealOpen(deal: Pick<DealLike, 'status'>): boolean {
  return deal.status === DealStatus.OPEN || deal.status === DealStatus.ON_HOLD
}

export function dealStatusTone(status: DealStatus): 'info' | 'positive' | 'negative' | 'warning' {
  if (status === DealStatus.WON) return 'positive'
  if (status === DealStatus.LOST) return 'negative'
  if (status === DealStatus.ON_HOLD) return 'warning'
  return 'info'
}

export function openDealsValue(deals: ReadonlyArray<DealLike>): number {
  return deals.reduce((total, deal) => (isDealOpen(deal) ? total + deal.valueCents : total), 0)
}

export function openDealCount(deals: ReadonlyArray<DealLike>): number {
  return deals.filter((deal) => isDealOpen(deal)).length
}

export function sortDealsForRecord<T extends DealLike>(deals: ReadonlyArray<T>): ReadonlyArray<T> {
  return [...deals].sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    return byStatus === 0 ? b.valueCents - a.valueCents : byStatus
  })
}
