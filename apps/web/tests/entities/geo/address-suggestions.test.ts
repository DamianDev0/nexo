import { describe, expect, it } from 'vitest'

import { MAX_ADDRESS_SUGGESTIONS } from '@/entities/geo/config/address.constants'
import { buildAddressSuggestions } from '@/entities/geo/lib/address-suggestions'

describe('buildAddressSuggestions', () => {
  it('suggests matching address types for a single token', () => {
    expect(buildAddressSuggestions('cra')).toEqual(['Carrera'])
  })

  it('trims leading whitespace before reading the token', () => {
    expect(buildAddressSuggestions('  cra')).toEqual(['Carrera'])
  })

  it('is case-insensitive and accent-insensitive', () => {
    expect(buildAddressSuggestions('CRA')).toContain('Carrera')
  })

  it('returns an empty list once the input has more than one word', () => {
    expect(buildAddressSuggestions('cra 15')).toEqual([])
  })

  it('returns an empty list for an empty input', () => {
    expect(buildAddressSuggestions('')).toEqual([])
  })

  it('returns an empty list when only whitespace was typed', () => {
    expect(buildAddressSuggestions('   ')).toEqual([])
  })

  it('caps the results at MAX_ADDRESS_SUGGESTIONS', () => {
    const suggestions = buildAddressSuggestions('c')
    expect(suggestions.length).toBeLessThanOrEqual(MAX_ADDRESS_SUGGESTIONS)
  })
})
