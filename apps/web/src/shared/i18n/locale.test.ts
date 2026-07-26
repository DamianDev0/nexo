import { describe, expect, it } from 'vitest'

import { isLocale, negotiateLocale } from './locale'

describe('negotiateLocale', () => {
  it('picks the first supported language from the header', () => {
    expect(negotiateLocale('en-US,en;q=0.9,es;q=0.8')).toBe('en')
  })

  it('skips unsupported languages until a supported one appears', () => {
    expect(negotiateLocale('fr-FR,fr;q=0.9,es-CO;q=0.8')).toBe('es')
  })

  it('falls back to the default locale when nothing matches', () => {
    expect(negotiateLocale('fr-FR,de;q=0.9')).toBe('es')
    expect(negotiateLocale('')).toBe('es')
  })
})

describe('isLocale', () => {
  it('accepts only supported locales', () => {
    expect(isLocale('es')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('fr')).toBe(false)
  })
})
