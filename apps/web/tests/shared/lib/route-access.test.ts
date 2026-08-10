import { describe, expect, it } from 'vitest'

import { decideRoute, isGuestOnlyPath } from '@/shared/lib/route-access'

describe('decideRoute', () => {
  describe('without session', () => {
    it('redirects protected app routes to login', () => {
      expect(decideRoute('/dashboard', false)).toBe('redirect-login')
    })

    it('redirects setup wizard to login', () => {
      expect(decideRoute('/onboarding/setup', false)).toBe('redirect-login')
    })

    it('allows the login page', () => {
      expect(decideRoute('/login', false)).toBe('allow')
    })

    it('allows the signup page', () => {
      expect(decideRoute('/onboarding', false)).toBe('allow')
    })
  })

  describe('with session', () => {
    it('allows protected app routes', () => {
      expect(decideRoute('/dashboard', true)).toBe('allow')
    })

    it('allows the setup wizard', () => {
      expect(decideRoute('/onboarding/setup', true)).toBe('allow')
    })

    it('redirects the login page to dashboard', () => {
      expect(decideRoute('/login', true)).toBe('redirect-dashboard')
    })

    it('redirects the signup page to dashboard', () => {
      expect(decideRoute('/onboarding', true)).toBe('redirect-dashboard')
    })
  })

  it('treats nested protected paths as protected', () => {
    expect(decideRoute('/dashboard/reports', false)).toBe('redirect-login')
  })

  it('does not confuse the signup page with the protected setup wizard', () => {
    expect(decideRoute('/onboarding', true)).toBe('redirect-dashboard')
    expect(decideRoute('/onboarding/setup', true)).toBe('allow')
  })

  it('allows unknown public paths', () => {
    expect(decideRoute('/some-public-page', false)).toBe('allow')
  })

  it('allows an unknown public path even with an active session', () => {
    expect(decideRoute('/some-public-page', true)).toBe('allow')
  })
})

describe('isGuestOnlyPath', () => {
  it('never treats a protected path as guest-only, even if it shares a guest prefix', () => {
    expect(isGuestOnlyPath('/onboarding/setup')).toBe(false)
  })

  it('treats the guest-only paths as guest-only', () => {
    expect(isGuestOnlyPath('/login')).toBe(true)
    expect(isGuestOnlyPath('/onboarding')).toBe(true)
  })

  it('does not treat unrelated public paths as guest-only', () => {
    expect(isGuestOnlyPath('/some-public-page')).toBe(false)
  })
})
