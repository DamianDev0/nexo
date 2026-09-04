import { describe, expect, it } from 'vitest'

import { formatCallLogDate } from '@/features/place-call/lib/call-log'

const NOON_BOGOTA = Date.UTC(2026, 8, 4, 17, 0)

describe('formatCallLogDate', () => {
  it('shows the time for same-day calls in Bogota', () => {
    const morning = Date.UTC(2026, 8, 4, 15, 0)
    expect(formatCallLogDate(morning, NOON_BOGOTA)).toBe('10:00')
  })

  it('shows DD/MM/YYYY for older calls', () => {
    const monday = Date.UTC(2026, 8, 1, 15, 0)
    expect(formatCallLogDate(monday, NOON_BOGOTA)).toBe('01/09/2026')
  })

  it('respects the Bogota day boundary, not UTC', () => {
    const lateNightUtc = Date.UTC(2026, 8, 4, 3, 0)
    expect(formatCallLogDate(lateNightUtc, NOON_BOGOTA)).toBe('03/09/2026')
  })
})
