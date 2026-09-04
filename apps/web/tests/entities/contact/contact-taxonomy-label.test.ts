import { describe, expect, it } from 'vitest'

import { taxonomyLabel } from '@/entities/contact/lib/contact-taxonomy-label'

const MAP = new Map([['manual', { key: 'manual', label: 'Manual', color: '#64748B' }]])

describe('taxonomyLabel', () => {
  it('returns null for a null key', () => {
    expect(taxonomyLabel(MAP, null)).toBeNull()
  })

  it('resolves the label for a known key', () => {
    expect(taxonomyLabel(MAP, 'manual')).toBe('Manual')
  })

  it('falls back to the raw key when the taxonomy has no entry', () => {
    expect(taxonomyLabel(MAP, 'unmapped')).toBe('unmapped')
  })
})
