import { describe, expect, it } from 'vitest'

import { buildContactCellLabels } from '@/entities/contact/lib/contact-cell-labels'

const t = ((key: string) => key) as never

describe('buildContactCellLabels', () => {
  it('resolves every cell label once from the shared namespaces', () => {
    const labels = buildContactCellLabels(t)

    expect(labels.phone).toEqual({ copy: 'common.copy', action: 'contacts.rowActions.call' })
    expect(labels.whatsapp.blocked).toBe('contacts.optOut.whatsapp')
    expect(labels.email.blocked).toBe('contacts.optOut.email')
    expect(labels.document.invalid).toBe('contacts.document.invalid')
    expect(labels.stale).toBe('contacts.recency.stale')
  })

  it('shares one tags label object between the name strip and the tags cell', () => {
    const labels = buildContactCellLabels(t)

    expect(labels.name.tags).toBe(labels.tags)
    expect(labels.tags.count(3)).toBe('contacts.tagCount')
  })
})
