import { ContactStatus } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import type { TFunction } from 'i18next'

import {
  buildSmartLists,
  listIdToStatus,
  statusToListId,
} from '@/features/manage-contacts/model/contact-lists'

const t = ((key: string) => key) as TFunction

describe('buildSmartLists', () => {
  it('returns the "all" list plus one entry per tracked status', () => {
    const lists = buildSmartLists(t)

    expect(lists).toHaveLength(6)
    expect(lists[0]).toEqual({ id: 'all', label: 'contacts.lists.all' })
    expect(lists.map((l) => l.id)).toEqual([
      'all',
      ContactStatus.NEW,
      ContactStatus.IN_CONTACT,
      ContactStatus.QUALIFIED,
      ContactStatus.CLIENT,
      ContactStatus.LOST,
    ])
  })
})

describe('listIdToStatus', () => {
  it('maps "all" to null', () => {
    expect(listIdToStatus('all')).toBeNull()
  })

  it('maps any other id to itself as a status', () => {
    expect(listIdToStatus(ContactStatus.QUALIFIED)).toBe(ContactStatus.QUALIFIED)
  })
})

describe('statusToListId', () => {
  it('maps null to "all"', () => {
    expect(statusToListId(null)).toBe('all')
  })

  it('maps a status back to its own id', () => {
    expect(statusToListId(ContactStatus.CLIENT)).toBe(ContactStatus.CLIENT)
  })
})
