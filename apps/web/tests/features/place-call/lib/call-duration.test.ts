import { describe, expect, it } from 'vitest'

import { formatCallDuration } from '@/features/place-call/lib/call-duration'

describe('formatCallDuration', () => {
  it('formats zero as 00:00', () => {
    expect(formatCallDuration(0)).toBe('00:00')
  })

  it('pads seconds under ten', () => {
    expect(formatCallDuration(7)).toBe('00:07')
  })

  it('rolls seconds into minutes', () => {
    expect(formatCallDuration(75)).toBe('01:15')
  })

  it('keeps counting past an hour worth of minutes', () => {
    expect(formatCallDuration(3725)).toBe('62:05')
  })

  it('clamps negative input to zero', () => {
    expect(formatCallDuration(-10)).toBe('00:00')
  })

  it('floors fractional seconds', () => {
    expect(formatCallDuration(59.9)).toBe('00:59')
  })
})
