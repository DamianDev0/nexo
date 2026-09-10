import { describe, expect, it } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'

import type { TFunction } from 'i18next'

import { buildAttributionRows } from '@/views/contact-detail/lib/build-attribution-rows'

const t = ((key: string) => key) as TFunction
const CONTACT = CONTACTS_FIXTURE[0]!

function rowsFor(overrides = {}) {
  const rows = buildAttributionRows(t, { ...CONTACT, ...overrides }, 'es')
  return new Map(rows.map((row) => [row.key, row.value]))
}

describe('buildAttributionRows', () => {
  it('reports where the contact came from and who owns it', () => {
    expect([...rowsFor().keys()]).toEqual(['source', 'owner', 'lastContacted', 'createdAt'])
  })

  it('names the owner when the contact has one', () => {
    expect(rowsFor({ assignedToName: 'Ana Guerrero' }).get('owner')).toBe('Ana Guerrero')
  })

  it('falls back to a placeholder for an unowned, unsourced contact', () => {
    const rows = rowsFor({ assignedToName: null, source: null })

    expect(rows.get('owner')).toBe('contacts.detail.attribution.unassigned')
    expect(rows.get('source')).toBe('contacts.detail.attribution.noSource')
  })

  it('says never when the contact was never contacted', () => {
    expect(rowsFor({ lastContactedAt: null }).get('lastContacted')).toBe(
      'contacts.detail.attribution.never',
    )
  })

  it('renders a relative time once the contact has been reached', () => {
    const value = rowsFor({ lastContactedAt: new Date().toISOString() }).get('lastContacted')

    expect(value).not.toBe('contacts.detail.attribution.never')
    expect(value).toBeTruthy()
  })
})
