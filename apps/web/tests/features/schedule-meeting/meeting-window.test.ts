import { describe, expect, it } from 'vitest'

import {
  clockToMinutes,
  formatDuration,
  meetingDuration,
  reminderIso,
} from '@/features/schedule-meeting/lib/meeting-window'

describe('meetingDuration', () => {
  it('measures a meeting inside one day', () => {
    expect(meetingDuration('09:00', '10:00')).toBe(60)
    expect(meetingDuration('14:15', '15:45')).toBe(90)
  })

  it('wraps past midnight instead of returning a negative span', () => {
    expect(meetingDuration('23:00', '00:30')).toBe(90)
  })

  it('treats an end equal to the start as a full day', () => {
    expect(meetingDuration('09:00', '09:00')).toBe(1440)
  })

  it('never exceeds what the API accepts', () => {
    expect(meetingDuration('23:59', '23:58')).toBeLessThanOrEqual(1440)
  })
})

describe('clockToMinutes', () => {
  it('reads a clock into minutes past midnight', () => {
    expect(clockToMinutes('00:00')).toBe(0)
    expect(clockToMinutes('09:30')).toBe(570)
    expect(clockToMinutes('23:59')).toBe(1439)
  })
})

describe('formatDuration', () => {
  it('writes minutes alone under an hour', () => {
    expect(formatDuration(45)).toBe('45m')
  })

  it('drops the minutes on a whole hour', () => {
    expect(formatDuration(120)).toBe('2h')
  })

  it('writes both parts otherwise', () => {
    expect(formatDuration(90)).toBe('1h 30m')
  })
})

describe('reminderIso', () => {
  it('asks for no reminder when none was chosen', () => {
    expect(reminderIso('2026-09-15T14:00:00.000Z', 0)).toBeUndefined()
  })

  it('lands the reminder before the meeting', () => {
    expect(reminderIso('2026-09-15T14:00:00.000Z', 30)).toBe('2026-09-15T13:30:00.000Z')
  })

  it('reaches back a full day', () => {
    expect(reminderIso('2026-09-15T14:00:00.000Z', 1440)).toBe('2026-09-14T14:00:00.000Z')
  })
})
