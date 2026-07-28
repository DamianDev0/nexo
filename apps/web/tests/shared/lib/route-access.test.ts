import { describe, expect, it } from 'vitest'

import { decideRoute } from '@/shared/lib/route-access'

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
})
