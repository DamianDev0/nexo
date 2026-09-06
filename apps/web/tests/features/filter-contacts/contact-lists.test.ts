import { describe, expect, it } from 'vitest'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { TFunction } from 'i18next'

import {
  buildSmartLists,
  isArchivedList,
  contactsQueryString,
  listIdToStatus,
  parseListParam,
  statusToListId,
} from '@/features/filter-contacts/lib/contact-lists'

const KNOWN_KEYS = new Set(['contacts.lists.descriptions.new'])

const t = ((key: string, opts?: { defaultValue?: string }) =>
  KNOWN_KEYS.has(key) ? 'Fresh leads' : (opts?.defaultValue ?? key)) as TFunction

const STATUSES: ReadonlyArray<TaxonomyChoice> = [
  { key: 'new', label: 'New', color: '#3B82F6' },
  { key: 'in_contact', label: 'In contact', color: '#8B5CF6' },
  { key: 'vip', label: 'VIP', color: '#F59E0B' },
]

describe('buildSmartLists', () => {
  it('returns the "all" list plus one entry per taxonomy status', () => {
    const lists = buildSmartLists(t, { all: 12, new: 3 }, STATUSES)

    expect(lists).toHaveLength(5)
    expect(lists[0]).toMatchObject({ id: 'all', label: 'contacts.lists.all', count: 12 })
    expect(lists[0]?.description).toBe('contacts.lists.descriptions.all')
    expect(lists[0]?.pinned).toBe(true)
    expect(lists[2]).toMatchObject({ id: 'new', label: 'New', count: 3 })
    expect(lists[2]?.pinned).toBeUndefined()
    expect(lists[2]?.description).toBe('Fresh leads')
    expect(lists.map((l) => l.id)).toEqual(['all', 'archived', 'new', 'in_contact', 'vip'])
  })

  it('defaults missing counts to zero and custom descriptions to undefined', () => {
    const lists = buildSmartLists(t, {}, STATUSES)

    expect(lists[4]).toMatchObject({ id: 'vip', label: 'VIP', count: 0 })
    expect(lists[4]?.description).toBeUndefined()
  })

  it('places the archived list right after all, fed by its own count', () => {
    const lists = buildSmartLists(t, { archived: 7 }, STATUSES)

    expect(lists[1]).toMatchObject({ id: 'archived', label: 'contacts.lists.archived', count: 7 })
    expect(isArchivedList('archived')).toBe(true)
    expect(isArchivedList('new')).toBe(false)
  })
})

describe('listIdToStatus', () => {
  it('maps "all" to null', () => {
    expect(listIdToStatus('all')).toBeNull()
  })

  it('maps any other id to itself as a status', () => {
    expect(listIdToStatus('qualified')).toBe('qualified')
  })
})

describe('parseListParam', () => {
  it('maps empty and "all" to null', () => {
    expect(parseListParam(null)).toBeNull()
    expect(parseListParam('')).toBeNull()
    expect(parseListParam('all')).toBeNull()
  })

  it('accepts valid taxonomy keys and rejects invalid ones', () => {
    expect(parseListParam('in_contact')).toBe('in_contact')
    expect(parseListParam('Not-Valid!')).toBeNull()
  })
})

describe('contactsQueryString', () => {
  it('returns an empty string when nothing is active', () => {
    expect(contactsQueryString({ status: null, search: '   ' })).toBe('')
  })

  it('serializes status, trimmed search and comma-joined filters', () => {
    const qs = contactsQueryString({
      status: 'client',
      search: '  ana  ',
      filters: { source: ['whatsapp', 'referral'], lifecycleStage: [] },
    })

    expect(qs).toBe('?list=client&q=ana&source=whatsapp%2Creferral')
  })
})

describe('statusToListId', () => {
  it('maps null to "all"', () => {
    expect(statusToListId(null)).toBe('all')
  })

  it('maps a status back to its own id', () => {
    expect(statusToListId('client')).toBe('client')
  })
})
