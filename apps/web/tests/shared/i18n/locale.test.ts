import { describe, expect, it } from 'vitest'

import { DEFAULT_LOCALE, isLocale } from '@/shared/i18n/locale'

describe('DEFAULT_LOCALE', () => {
  it('is Spanish — the product default regardless of browser language', () => {
    expect(DEFAULT_LOCALE).toBe('es')
  })
})

describe('isLocale', () => {
  it('accepts only supported locales', () => {
    expect(isLocale('es')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('fr')).toBe(false)
  })
})
