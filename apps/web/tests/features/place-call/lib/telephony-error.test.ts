import { describe, expect, it } from 'vitest'

import { toTelephonyError } from '@/features/place-call/lib/telephony-error'

describe('toTelephonyError', () => {
  it.each([
    [20104, 'tokenExpired'],
    [31205, 'tokenExpired'],
    [31005, 'networkError'],
    [31486, 'busy'],
    [31603, 'callRejected'],
    [31404, 'invalidNumber'],
    [31401, 'microphoneDenied'],
    [31402, 'microphoneDenied'],
    [31001, 'deviceNotReady'],
    [31206, 'providerError'],
  ])('maps Twilio code %i to %s', (code, expected) => {
    expect(toTelephonyError({ code })).toBe(expected)
  })

  it('falls back to callFailed for unknown codes and non-Twilio errors', () => {
    expect(toTelephonyError({ code: 99999 })).toBe('callFailed')
    expect(toTelephonyError(new Error('boom'))).toBe('callFailed')
    expect(toTelephonyError(null)).toBe('callFailed')
    expect(toTelephonyError('nope')).toBe('callFailed')
  })
})
