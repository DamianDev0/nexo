import { describe, expect, it } from 'vitest'

import {
  formatClock,
  hourOptions,
  minuteOptions,
  parseClock,
  toClock,
} from '@/shared/ui/molecules/time-picker/clock'

describe('parseClock', () => {
  it('splits a 24h clock into its 12h parts', () => {
    expect(parseClock('09:05')).toEqual({ hour12: 9, minute: 5, meridiem: 'AM' })
    expect(parseClock('14:45')).toEqual({ hour12: 2, minute: 45, meridiem: 'PM' })
  })

  it('keeps midnight and noon on the right side of the meridiem', () => {
    expect(parseClock('00:00')).toEqual({ hour12: 12, minute: 0, meridiem: 'AM' })
    expect(parseClock('12:30')).toEqual({ hour12: 12, minute: 30, meridiem: 'PM' })
  })

  it('falls back to midnight for junk', () => {
    expect(parseClock('')).toEqual({ hour12: 12, minute: 0, meridiem: 'AM' })
    expect(parseClock('99:99')).toEqual({ hour12: 11, minute: 59, meridiem: 'PM' })
  })
})

describe('toClock', () => {
  it('rebuilds the 24h clock the form stores', () => {
    expect(toClock({ hour12: 9, minute: 5, meridiem: 'AM' })).toBe('09:05')
    expect(toClock({ hour12: 2, minute: 45, meridiem: 'PM' })).toBe('14:45')
    expect(toClock({ hour12: 12, minute: 0, meridiem: 'AM' })).toBe('00:00')
    expect(toClock({ hour12: 12, minute: 0, meridiem: 'PM' })).toBe('12:00')
  })

  it('round-trips every hour of the day', () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const clock = `${String(hour).padStart(2, '0')}:15`
      expect(toClock(parseClock(clock))).toBe(clock)
    }
  })
})

describe('formatClock', () => {
  it('reads the way the trigger shows it', () => {
    expect(formatClock('09:00')).toBe('09:00 AM')
    expect(formatClock('14:45')).toBe('02:45 PM')
  })
})

describe('options', () => {
  it('offers the twelve hours of the dial', () => {
    expect(hourOptions()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  it('walks the minutes by the step it was given', () => {
    expect(minuteOptions(15)).toEqual([0, 15, 30, 45])
    expect(minuteOptions(5)).toHaveLength(12)
    expect(minuteOptions(0)).toHaveLength(60)
  })

  it('keeps an off-step minute the record already had', () => {
    expect(minuteOptions(15, 7)).toEqual([0, 7, 15, 30, 45])
    expect(minuteOptions(15, 30)).toEqual([0, 15, 30, 45])
  })
})
