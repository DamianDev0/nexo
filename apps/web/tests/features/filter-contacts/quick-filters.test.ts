import { LifecycleStage } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { TFunction } from 'i18next'

import { EMPTY_QUICK_FILTERS } from '@/features/filter-contacts/config/quick-filters.constants'
import {
  buildQuickFilterDefs,
  clearQuickFilters,
  hasQuickFilters,
  parseQuickFilters,
  toggleQuickFilter,
} from '@/features/filter-contacts/lib/quick-filters'

const t = ((key: string, opts?: { defaultValue?: string }) =>
  opts?.defaultValue ?? key) as TFunction

const SOURCES: ReadonlyArray<TaxonomyChoice> = [
  { key: 'manual', label: 'Manual', color: '#3B82F6' },
  { key: 'whatsapp', label: 'WhatsApp', color: '#22C55E' },
]

const LIFECYCLE_STAGES: ReadonlyArray<TaxonomyChoice> = [
  { key: LifecycleStage.SUBSCRIBER, label: 'Suscriptor', color: '#94A3B8' },
  { key: LifecycleStage.LEAD, label: 'Lead ES', color: '#60A5FA' },
]

const CHOICES = { sources: SOURCES, lifecycleStages: LIFECYCLE_STAGES }

describe('parseQuickFilters', () => {
  it('keeps a lifecycleStage value that matches the taxonomy key pattern', () => {
    const state = parseQuickFilters((key) =>
      key === 'lifecycleStage' ? LifecycleStage.LEAD : null,
    )

    expect(state.lifecycleStage).toEqual([LifecycleStage.LEAD])
  })

  it('drops a lifecycleStage value that does not match the taxonomy key pattern', () => {
    const state = parseQuickFilters((key) => (key === 'lifecycleStage' ? 'not-a-stage' : null))

    expect(state.lifecycleStage).toEqual([])
  })

  it('keeps a custom lifecycleStage key because the tenant owns the catalog', () => {
    const state = parseQuickFilters((key) => (key === 'lifecycleStage' ? 'random_key' : null))

    expect(state.lifecycleStage).toEqual(['random_key'])
  })

  it('keeps a source value that matches the taxonomy key pattern', () => {
    const state = parseQuickFilters((key) => (key === 'source' ? 'manual' : null))

    expect(state.source).toEqual(['manual'])
  })

  it('drops a source value that does not match the taxonomy key pattern', () => {
    const state = parseQuickFilters((key) => (key === 'source' ? 'Not Valid!' : null))

    expect(state.source).toEqual([])
  })

  it('returns the empty state when nothing is present', () => {
    expect(parseQuickFilters(() => null)).toEqual(EMPTY_QUICK_FILTERS)
  })
})

describe('toggleQuickFilter', () => {
  it('selects a value when none is selected', () => {
    const next = toggleQuickFilter(EMPTY_QUICK_FILTERS, 'source', 'manual')

    expect(next.source).toEqual(['manual'])
  })

  it('deselects the value when it is already selected', () => {
    const state = { ...EMPTY_QUICK_FILTERS, source: ['manual'] }

    const next = toggleQuickFilter(state, 'source', 'manual')

    expect(next.source).toEqual([])
  })

  it('is a no-op for an unknown filter id', () => {
    const next = toggleQuickFilter(EMPTY_QUICK_FILTERS, 'unknown', 'manual')

    expect(next).toBe(EMPTY_QUICK_FILTERS)
  })
})

describe('clearQuickFilters', () => {
  it('clears a single filter when a filterId is given', () => {
    const state = { lifecycleStage: [LifecycleStage.LEAD], source: ['manual'] }

    const next = clearQuickFilters(state, 'source')

    expect(next.source).toEqual([])
    expect(next.lifecycleStage).toEqual([LifecycleStage.LEAD])
  })

  it('clears every filter when no filterId is given', () => {
    const state = { lifecycleStage: [LifecycleStage.LEAD], source: ['manual'] }

    expect(clearQuickFilters(state)).toEqual(EMPTY_QUICK_FILTERS)
  })

  it('is a no-op for an unknown filter id', () => {
    const state = { lifecycleStage: [LifecycleStage.LEAD], source: ['manual'] }

    expect(clearQuickFilters(state, 'bogus')).toBe(state)
  })
})

describe('hasQuickFilters', () => {
  it('is false when every filter is empty', () => {
    expect(hasQuickFilters(EMPTY_QUICK_FILTERS)).toBe(false)
  })

  it('is true when at least one filter has a value', () => {
    expect(hasQuickFilters({ ...EMPTY_QUICK_FILTERS, source: ['manual'] })).toBe(true)
  })
})

describe('buildQuickFilterDefs', () => {
  it('builds the source options from the provided taxonomy choices', () => {
    const defs = buildQuickFilterDefs(t, EMPTY_QUICK_FILTERS, CHOICES)

    const sourceDef = defs.find((def) => def.id === 'source')
    expect(sourceDef?.options.map((o) => o.value)).toEqual(['manual', 'whatsapp'])
    expect(sourceDef?.options.map((o) => o.label)).toEqual(['Manual', 'WhatsApp'])
  })

  it('builds lifecycle stage options from the provided taxonomy choices', () => {
    const defs = buildQuickFilterDefs(t, EMPTY_QUICK_FILTERS, CHOICES)

    const lifecycleDef = defs.find((def) => def.id === 'lifecycleStage')
    expect(lifecycleDef?.options.map((o) => o.value)).toEqual([
      LifecycleStage.SUBSCRIBER,
      LifecycleStage.LEAD,
    ])
    expect(lifecycleDef?.options.map((o) => o.label)).toEqual(['Suscriptor', 'Lead ES'])
  })

  it('resolves labels and hints through the exact translation keys', () => {
    const translations: Record<string, string> = {
      'contacts.filters.source': 'Origen',
      'contacts.filters.lifecycleStage': 'Ciclo de vida',
      'common.filters.hints.source.whatsapp': 'Canal directo',
      [`common.filters.hints.lifecycleStage.${LifecycleStage.LEAD}`]: 'Pinta bien',
    }
    const tExact = ((key: string, opts?: { defaultValue?: string }) =>
      translations[key] ?? opts?.defaultValue ?? key) as TFunction

    const defs = buildQuickFilterDefs(tExact, EMPTY_QUICK_FILTERS, CHOICES)
    const sourceDef = defs.find((def) => def.id === 'source')
    const lifecycleDef = defs.find((def) => def.id === 'lifecycleStage')

    expect(sourceDef?.label).toBe('Origen')
    expect(lifecycleDef?.label).toBe('Ciclo de vida')
    expect(sourceDef?.options.find((o) => o.value === 'whatsapp')?.hint).toBe('Canal directo')
    expect(sourceDef?.options.find((o) => o.value === 'manual')?.hint).toBeUndefined()

    const lead = lifecycleDef?.options.find((o) => o.value === LifecycleStage.LEAD)
    expect(lead?.label).toBe('Lead ES')
    expect(lead?.hint).toBe('Pinta bien')
    const subscriber = lifecycleDef?.options.find((o) => o.value === LifecycleStage.SUBSCRIBER)
    expect(subscriber?.hint).toBeUndefined()
  })
})
