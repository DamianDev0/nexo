import { describe, expect, it } from 'vitest'

import {
  buildMonthGrid,
  monthLabel,
  parseIsoDate,
  toDisplayDate,
  toIsoDate,
  weekdayLabels,
} from '@/shared/ui/molecules/date-picker/date-iso'

describe('parseIsoDate', () => {
  it('parses an ISO date into a local Date', () => {
    const date = parseIsoDate('2026-08-31')
    expect(date?.getFullYear()).toBe(2026)
    expect(date?.getMonth()).toBe(7)
    expect(date?.getDate()).toBe(31)
  })

  it('returns undefined for empty or malformed input', () => {
    expect(parseIsoDate(undefined)).toBeUndefined()
    expect(parseIsoDate('')).toBeUndefined()
    expect(parseIsoDate('31/08/2026')).toBeUndefined()
  })
})

describe('toIsoDate', () => {
  it('formats with zero-padded month and day', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('round-trips with parseIsoDate without UTC drift', () => {
    expect(toIsoDate(parseIsoDate('2026-12-31') as Date)).toBe('2026-12-31')
  })
})

describe('toDisplayDate', () => {
  it('renders DD/MM/YYYY per the Colombia convention', () => {
    expect(toDisplayDate('2026-08-05')).toBe('05/08/2026')
  })

  it('returns empty string without a value', () => {
    expect(toDisplayDate(undefined)).toBe('')
  })
})

describe('buildMonthGrid', () => {
  it('always yields 42 cells starting on Monday', () => {
    const grid = buildMonthGrid(2026, 8)
    expect(grid).toHaveLength(42)
    expect(grid[0]?.iso).toBe('2026-08-31')
    expect(grid[0]?.inMonth).toBe(false)
    expect(grid[1]?.iso).toBe('2026-09-01')
    expect(grid[1]?.inMonth).toBe(true)
  })

  it('marks trailing next-month days as outside', () => {
    const grid = buildMonthGrid(2026, 1)
    const last = grid.at(-1)
    expect(last?.inMonth).toBe(false)
  })
})

describe('locale labels', () => {
  it('labels the month in Spanish for es-CO', () => {
    expect(monthLabel(2026, 8, 'es-CO')).toMatch(/septiembre/i)
  })

  it('yields seven Monday-first weekday labels', () => {
    const labels = weekdayLabels('es-CO')
    expect(labels).toHaveLength(7)
    expect(labels[0]?.toLowerCase()).toContain('lu')
  })
})
