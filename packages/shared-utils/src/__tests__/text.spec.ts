import { blankToUndefined, normalizeText, slugify } from '../text'

describe('text helpers', () => {
  it('normalizes accents and case', () => {
    expect(normalizeText('  Bogotá ')).toBe('bogota')
  })

  it('slugifies to url-safe kebab case', () => {
    expect(slugify('Distribuidora ABC & Cía')).toBe('distribuidora-abc-cia')
  })

  it('maps empty, null and undefined to undefined and keeps other strings', () => {
    expect(blankToUndefined('')).toBeUndefined()
    expect(blankToUndefined(null)).toBeUndefined()
    expect(blankToUndefined(undefined)).toBeUndefined()
    expect(blankToUndefined(' ')).toBe(' ')
    expect(blankToUndefined('0')).toBe('0')
  })
})
