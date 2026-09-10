import { describe, expect, it } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'

import type { TFunction } from 'i18next'

import { buildEngagementRows } from '@/views/contact-detail/lib/build-engagement-rows'

const t = ((key: string) => key) as TFunction
const CONTACT = CONTACTS_FIXTURE[0]!

function rowsFor(overrides = {}) {
  const rows = buildEngagementRows(t, { ...CONTACT, ...overrides }, 'es')
  return new Map(rows.map((row) => [row.key, row.value]))
}

describe('buildEngagementRows', () => {
  it('reports every engagement field the tab shows', () => {
    expect([...rowsFor().keys()]).toEqual(['lifecycle', 'owner', 'lastContacted', 'createdAt'])
  })

  it('names the owner when the contact has one', () => {
    expect(rowsFor({ assignedToName: 'Ana Guerrero' }).get('owner')).toBe('Ana Guerrero')
  })

  it('says unassigned when nobody owns the contact', () => {
    expect(rowsFor({ assignedToName: null }).get('owner')).toBe(
      'contacts.detail.engagement.unassigned',
    )
  })

  it('says never when the contact was never contacted', () => {
    expect(rowsFor({ lastContactedAt: null }).get('lastContacted')).toBe(
      'contacts.detail.engagement.never',
    )
  })

  it('renders a relative time once the contact has been reached', () => {
    const value = rowsFor({ lastContactedAt: new Date().toISOString() }).get('lastContacted')

    expect(value).not.toBe('contacts.detail.engagement.never')
    expect(value).toBeTruthy()
  })
})
