import { DealStatus } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import {
  dealStatusTone,
  isDealOpen,
  openDealCount,
  openDealsValue,
  sortDealsForRecord,
} from '@/entities/deal/lib/deal-display'

function deal(status: DealStatus, valueCents: number) {
  return { status, valueCents, expectedCloseDate: null }
}

describe('isDealOpen', () => {
  it('counts an on-hold deal as still live', () => {
    expect(isDealOpen(deal(DealStatus.OPEN, 0))).toBe(true)
    expect(isDealOpen(deal(DealStatus.ON_HOLD, 0))).toBe(true)
    expect(isDealOpen(deal(DealStatus.WON, 0))).toBe(false)
    expect(isDealOpen(deal(DealStatus.LOST, 0))).toBe(false)
  })
})

describe('dealStatusTone', () => {
  it('gives every status its own tone', () => {
    expect(dealStatusTone(DealStatus.OPEN)).toBe('info')
    expect(dealStatusTone(DealStatus.ON_HOLD)).toBe('warning')
    expect(dealStatusTone(DealStatus.WON)).toBe('positive')
    expect(dealStatusTone(DealStatus.LOST)).toBe('negative')
  })
})

describe('openDealsValue', () => {
  it('adds only what is still in play, in cents', () => {
    const deals = [
      deal(DealStatus.OPEN, 10_000_000),
      deal(DealStatus.ON_HOLD, 5_000_000),
      deal(DealStatus.WON, 900_000_000),
      deal(DealStatus.LOST, 700_000_000),
    ]

    expect(openDealsValue(deals)).toBe(15_000_000)
    expect(Number.isInteger(openDealsValue(deals))).toBe(true)
    expect(openDealCount(deals)).toBe(2)
  })

  it('is zero with nothing open', () => {
    expect(openDealsValue([])).toBe(0)
    expect(openDealCount([deal(DealStatus.LOST, 1)])).toBe(0)
  })
})

describe('sortDealsForRecord', () => {
  it('puts live deals first and the biggest money on top of each group', () => {
    const deals = [
      deal(DealStatus.LOST, 900_000_000),
      deal(DealStatus.OPEN, 2_000_000),
      deal(DealStatus.WON, 1_000_000),
      deal(DealStatus.OPEN, 8_000_000),
      deal(DealStatus.ON_HOLD, 3_000_000),
    ]

    expect(sortDealsForRecord(deals).map((d) => [d.status, d.valueCents])).toEqual([
      [DealStatus.OPEN, 8_000_000],
      [DealStatus.OPEN, 2_000_000],
      [DealStatus.ON_HOLD, 3_000_000],
      [DealStatus.WON, 1_000_000],
      [DealStatus.LOST, 900_000_000],
    ])
  })

  it('does not mutate what it was given', () => {
    const deals = [deal(DealStatus.WON, 1), deal(DealStatus.OPEN, 2)]
    sortDealsForRecord(deals)

    expect(deals[0]?.status).toBe(DealStatus.WON)
  })
})
