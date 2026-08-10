import { describe, expect, it } from 'vitest'

import { isSessionActive } from '@/shared/lib/session-token'

const NOW = 1_700_000_000_000

function jwt(payload: Record<string, unknown>): string {
  const body = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_')
  return `header.${body}.signature`
}

function jwtFromRawJson(rawJson: string): string {
  const body = btoa(rawJson).replace(/\+/g, '-').replace(/\//g, '_')
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

  it('reverses the url-safe dash back to a plus sign before decoding the payload', () => {
    const token = jwtFromRawJson('{"exp":1700000060,"pad":" >  "}')
    expect(isSessionActive(token, NOW)).toBe(true)
  })

  it('reverses the url-safe underscore back to a slash before decoding the payload', () => {
    const token = jwtFromRawJson('{"exp":1700000060,"pad":" ?  "}')
    expect(isSessionActive(token, NOW)).toBe(true)
  })

  it('rejects a non-numeric exp claim even though it would coerce truthy in arithmetic', () => {
    expect(isSessionActive(jwt({ exp: '9999999999' }), NOW)).toBe(false)
  })

  it('rejects an invalid token regardless of a non-positive reference time', () => {
    expect(isSessionActive(jwt({ sub: 'user-1' }), -1)).toBe(false)
  })

  it('rejects a token that expires at exactly the reference time', () => {
    const exp = NOW / 1000
    expect(isSessionActive(jwt({ exp }), NOW)).toBe(false)
  })

  it('rejects a token whose payload segment is not valid base64', () => {
    expect(isSessionActive('header.!!!not-base64!!!.signature', NOW)).toBe(false)
  })
})
