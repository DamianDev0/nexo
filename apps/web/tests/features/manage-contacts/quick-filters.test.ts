import { LifecycleStage } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { TFunction } from 'i18next'

import { EMPTY_QUICK_FILTERS } from '@/features/manage-contacts/config/quick-filters.constants'
import {
  buildQuickFilterDefs,
  clearQuickFilters,
  hasQuickFilters,
  parseQuickFilters,
  toggleQuickFilter,
} from '@/features/manage-contacts/lib/quick-filters'

const t = ((key: string, opts?: { defaultValue?: string }) =>
  opts?.defaultValue ?? key) as TFunction

const SOURCES: ReadonlyArray<TaxonomyChoice> = [
  { key: 'manual', label: 'Manual', color: '#3B82F6' },
  { key: 'whatsapp', label: 'WhatsApp', color: '#22C55E' },
]

describe('parseQuickFilters', () => {
  it('keeps a lifecycleStage value that belongs to the enum', () => {
    const state = parseQuickFilters((key) =>
      key === 'lifecycleStage' ? LifecycleStage.LEAD : null,
    )

    expect(state.lifecycleStage).toEqual([LifecycleStage.LEAD])
  })

  it('drops a lifecycleStage value outside the enum', () => {
    const state = parseQuickFilters((key) => (key === 'lifecycleStage' ? 'not-a-stage' : null))

    expect(state.lifecycleStage).toEqual([])
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
    const defs = buildQuickFilterDefs(t, EMPTY_QUICK_FILTERS, SOURCES)

    const sourceDef = defs.find((def) => def.id === 'source')
    expect(sourceDef?.options.map((o) => o.value)).toEqual(['manual', 'whatsapp'])
    expect(sourceDef?.options.map((o) => o.label)).toEqual(['Manual', 'WhatsApp'])
  })

  it('builds lifecycle stage options using the translated label fallback', () => {
    const defs = buildQuickFilterDefs(t, EMPTY_QUICK_FILTERS, SOURCES)

    const lifecycleDef = defs.find((def) => def.id === 'lifecycleStage')
    expect(lifecycleDef?.options.map((o) => o.value)).toEqual(Object.values(LifecycleStage))
    expect(lifecycleDef?.options[0]).toMatchObject({
      value: LifecycleStage.SUBSCRIBER,
      label: LifecycleStage.SUBSCRIBER,
    })
  })
})
