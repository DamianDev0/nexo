import { describe, expect, it } from 'vitest'

import {
  contactAvatarTone,
  contactFullName,
  contactInitials,
} from '@/entities/contact/lib/contact-display'

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

  it('falls back to the bare first initial when lastName is missing and firstName is one character', () => {
    expect(contactInitials({ firstName: 'M', lastName: null })).toBe('M')
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

  it('assigns different tones to ids that hash to different buckets', () => {
    expect(contactAvatarTone('a')).toBe('info')
    expect(contactAvatarTone('b')).toBe('warning')
    expect(contactAvatarTone('c')).toBe('neutral')
    expect(contactAvatarTone('d')).toBe('lime')
  })

  it('folds every character into the hash, not just the first', () => {
    expect(contactAvatarTone('contact-1')).toBe('info')
    expect(contactAvatarTone('contact-2')).toBe('warning')
  })
})
