import { ContactStatus } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import {
  CONTACT_STATUS_TONE,
  contactAvatarTone,
  contactFullName,
  contactInitials,
} from '@/entities/contact/model/contact-display'

describe('contactFullName', () => {
  it('joins firstName and lastName', () => {
    expect(contactFullName({ firstName: 'Maria', lastName: 'Lopez' })).toBe('Maria Lopez')
  })

  it('falls back to firstName alone when lastName is missing', () => {
    expect(contactFullName({ firstName: 'Maria', lastName: null })).toBe('Maria')
  })
})

describe('contactInitials', () => {
  it('builds initials from firstName and lastName', () => {
    expect(contactInitials({ firstName: 'Maria', lastName: 'Lopez' })).toBe('ML')
  })

  it('builds initials from a single name when lastName is missing', () => {
    expect(contactInitials({ firstName: 'Maria', lastName: null })).toBe('Ma')
  })
})

describe('contactAvatarTone', () => {
  const tones = ['lime', 'info', 'warning', 'neutral']

  it('is deterministic for the same id', () => {
    expect(contactAvatarTone('contact-1')).toBe(contactAvatarTone('contact-1'))
  })

  it('always returns one of the 4 known tones', () => {
    for (const id of ['contact-1', 'contact-2', 'a', 'zzzzzzzz', '']) {
      expect(tones).toContain(contactAvatarTone(id))
    }
  })
})

describe('CONTACT_STATUS_TONE', () => {
  it('covers all ContactStatus values', () => {
    const statuses = Object.values(ContactStatus)
    expect(Object.keys(CONTACT_STATUS_TONE)).toHaveLength(statuses.length)
    for (const status of statuses) {
      expect(CONTACT_STATUS_TONE[status]).toBeDefined()
    }
  })
})
