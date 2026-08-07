import { describe, expect, it } from 'vitest'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { TFunction } from 'i18next'

import {
  buildSmartLists,
  listIdToStatus,
  statusToListId,
} from '@/features/manage-contacts/model/contact-lists'

const t = ((key: string, opts?: { defaultValue?: string }) =>
  opts?.defaultValue ?? key) as TFunction

const STATUSES: ReadonlyArray<TaxonomyChoice> = [
  { key: 'new', label: 'New', color: '#3B82F6' },
  { key: 'in_contact', label: 'In contact', color: '#8B5CF6' },
  { key: 'vip', label: 'VIP', color: '#F59E0B' },
]

describe('buildSmartLists', () => {
  it('returns the "all" list plus one entry per taxonomy status', () => {
    const lists = buildSmartLists(t, { all: 12, new: 3 }, STATUSES)

    expect(lists).toHaveLength(4)
    expect(lists[0]).toMatchObject({ id: 'all', label: 'contacts.lists.all', count: 12 })
    expect(lists[0]?.description).toBe('contacts.lists.descriptions.all')
    expect(lists[1]).toMatchObject({ id: 'new', label: 'New', count: 3 })
    expect(lists.map((l) => l.id)).toEqual(['all', 'new', 'in_contact', 'vip'])
  })

  it('defaults missing counts to zero and custom descriptions to undefined', () => {
    const lists = buildSmartLists(t, {}, STATUSES)

    expect(lists[3]).toMatchObject({ id: 'vip', label: 'VIP', count: 0 })
    expect(lists[3]?.description).toBeUndefined()
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

describe('statusToListId', () => {
  it('maps null to "all"', () => {
    expect(statusToListId(null)).toBe('all')
  })

  it('maps a status back to its own id', () => {
    expect(statusToListId('client')).toBe('client')
  })
})
