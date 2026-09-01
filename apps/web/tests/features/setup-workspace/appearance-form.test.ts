import { describe, expect, it } from 'vitest'

import {
  APPEARANCE_DEFAULT_VALUES,
  THEME_PRESETS,
} from '@/features/setup-workspace/config/appearance.constants'
import {
  findPresetByKey,
  matchingPresetKey,
  withPreset,
} from '@/features/setup-workspace/lib/appearance'

describe('withPreset', () => {
  it('applies preset visuals while preserving branding fields', () => {
    const current = {
      ...APPEARANCE_DEFAULT_VALUES,
      productName: 'Acme CRM',
      tagline: 'Sell more',
      logoUrl: 'https://cdn.acme.co/logo.png',
    }
    const midnight = THEME_PRESETS.find((p) => p.key === 'midnight')
    if (!midnight) throw new Error('missing preset')

    const next = withPreset(current, midnight)

    expect(next.primaryColor).toBe(midnight.primary)
    expect(next.fontFamily).toBe(midnight.fontFamily)
    expect(next.darkMode).toBe(midnight.darkMode)
    expect(next.productName).toBe('Acme CRM')
    expect(next.tagline).toBe('Sell more')
    expect(next.logoUrl).toBe('https://cdn.acme.co/logo.png')
  })
})

describe('matchingPresetKey', () => {
  it('detects the active preset after applying it', () => {
    for (const preset of THEME_PRESETS) {
      const values = withPreset(APPEARANCE_DEFAULT_VALUES, preset)
      expect(matchingPresetKey(values)).toBe(preset.key)
    }
  })

  it('returns null once any dimension diverges', () => {
    const nexo = THEME_PRESETS.find((p) => p.key === 'nexo')
    if (!nexo) throw new Error('missing preset')
    const values = { ...withPreset(APPEARANCE_DEFAULT_VALUES, nexo), density: 'spacious' as const }
    expect(matchingPresetKey(values)).toBeNull()
  })

  it('returns null when only the primary color diverges', () => {
    const nexo = THEME_PRESETS.find((p) => p.key === 'nexo')
    if (!nexo) throw new Error('missing preset')
    const values = { ...withPreset(APPEARANCE_DEFAULT_VALUES, nexo), primaryColor: '#010203' }
    expect(matchingPresetKey(values)).toBeNull()
  })

  it('returns null when only the font family diverges', () => {
    const nexo = THEME_PRESETS.find((p) => p.key === 'nexo')
    if (!nexo) throw new Error('missing preset')
    const values = { ...withPreset(APPEARANCE_DEFAULT_VALUES, nexo), fontFamily: 'roboto' as const }
    expect(matchingPresetKey(values)).toBeNull()
  })

  it('returns null when only the border radius diverges', () => {
    const nexo = THEME_PRESETS.find((p) => p.key === 'nexo')
    if (!nexo) throw new Error('missing preset')
    const values = { ...withPreset(APPEARANCE_DEFAULT_VALUES, nexo), borderRadius: 'lg' as const }
    expect(matchingPresetKey(values)).toBeNull()
  })
})

describe('findPresetByKey', () => {
  it('returns the preset matching the key', () => {
    const preset = findPresetByKey('nexo')
    expect(preset?.key).toBe('nexo')
  })

  it('returns undefined for an unknown key', () => {
    expect(findPresetByKey('nope')).toBeUndefined()
  })
})
