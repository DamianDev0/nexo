import { describe, expect, it } from 'vitest'

import {
  contactAvatarTone,
  contactCreatedParts,
  contactAvatarUrl,
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

describe('contactAvatarUrl', () => {
  it('gives every contact a face without anyone choosing one', () => {
    const url = contactAvatarUrl({ id: 'contact-1', avatarUrl: null })

    expect(url).toMatch(/^https:\/\/res\.cloudinary\.com\//)
  })

  it('keeps the same face for the same contact across renders', () => {
    const first = contactAvatarUrl({ id: 'contact-42', avatarUrl: null })
    const second = contactAvatarUrl({ id: 'contact-42', avatarUrl: null })

    expect(first).toBe(second)
  })

  it('spreads different contacts across the catalogue', () => {
    const ids = Array.from({ length: 24 }, (_, index) => `contact-${index}`)
    const faces = new Set(ids.map((id) => contactAvatarUrl({ id, avatarUrl: null })))

    expect(faces.size).toBeGreaterThan(4)
  })

  it('lets an explicit pick win over the derived one', () => {
    const picked = 'https://res.cloudinary.com/dpqbn1gqb/image/upload/v1/peep-1.png'

    expect(contactAvatarUrl({ id: 'contact-1', avatarUrl: picked })).toBe(picked)
  })
})

describe('contactCreatedParts', () => {
  const iso = '2026-03-19T15:00:00.000Z'

  it('formats the date as DD/MM/YYYY in America/Bogota', () => {
    expect(contactCreatedParts(iso, 'es').date).toBe('19/03/2026')
  })

  it('formats the time in 12h Bogota time per locale', () => {
    expect(contactCreatedParts(iso, 'en').time).toBe('10:00 AM')
    expect(contactCreatedParts(iso, 'es').time.replaceAll(' ', ' ')).toContain('10:00')
  })

  it('rolls the date back when UTC midnight is still the previous day in Bogota', () => {
    expect(contactCreatedParts('2026-03-20T02:00:00.000Z', 'es').date).toBe('19/03/2026')
  })
})
