import { describe, expect, it } from 'vitest'

import { buildContact } from '../../msw/handlers'

import type { ContactTaxonomyMaps } from '@/entities/contact'

import { buildStatusHighlight } from '@/features/preview-contact/lib/status-highlight'

const TAXONOMY: ContactTaxonomyMaps = {
  statusByKey: new Map([['new', { key: 'new', label: 'Nuevo', color: '#3B82F6' }]]),
  sourceByKey: new Map(),
  lifecycleByKey: new Map([['lead', { key: 'lead', label: 'Prospecto', color: '#999' }]]),
}

describe('buildStatusHighlight', () => {
  it('resolves labels and colours from the taxonomy', () => {
    const contact = buildContact({ status: 'new', statusChangedAt: '2026-09-01T00:00:00.000Z' })
    expect(buildStatusHighlight(contact, TAXONOMY)).toEqual({
      label: 'Nuevo',
      color: '#3B82F6',
      since: '2026-09-01T00:00:00.000Z',
      lifecycle: 'Prospecto',
    })
  })

  it('falls back to the raw keys when the taxonomy misses them', () => {
    const contact = buildContact({ status: 'legacy', lifecycleStage: 'vip', statusChangedAt: null })
    expect(buildStatusHighlight(contact, TAXONOMY)).toEqual({
      label: 'legacy',
      color: null,
      since: null,
      lifecycle: 'vip',
    })
  })
})
