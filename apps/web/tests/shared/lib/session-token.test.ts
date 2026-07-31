import { describe, expect, it } from 'vitest'

import { isSessionActive } from '@/shared/lib/session-token'

const NOW = 1_700_000_000_000

function jwt(payload: Record<string, unknown>): string {
  const body = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_')
  return `header.${body}.signature`
}

describe('isSessionActive', () => {
  it('accepts a token whose expiry is still ahead', () => {
    expect(isSessionActive(jwt({ exp: NOW / 1000 + 60 }), NOW)).toBe(true)
  })

  it('rejects a token that already expired', () => {
    expect(isSessionActive(jwt({ exp: NOW / 1000 - 1 }), NOW)).toBe(false)
  })

  it('rejects a token without an expiry claim', () => {
    expect(isSessionActive(jwt({ sub: 'user-1' }), NOW)).toBe(false)
  })

  it('rejects a value that is not a jwt', () => {
    expect(isSessionActive('bogus', NOW)).toBe(false)
  })

  it('rejects a missing cookie', () => {
    expect(isSessionActive(undefined, NOW)).toBe(false)
  })
})
