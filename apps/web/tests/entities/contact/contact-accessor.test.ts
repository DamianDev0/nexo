import { describe, expect, it } from 'vitest'

import { CONTACTS_FIXTURE } from '../../msw/handlers'

import { contactAccessor } from '@/entities/contact/lib/contact-accessor'

const contact = {
  ...CONTACTS_FIXTURE[0]!,
  firstName: 'Maria',
  lastName: 'Lopez',
  phone: '+57 300 111 2233',
  whatsapp: '+57 300 444 5566',
  createdAt: '2026-08-14T15:00:00.000Z',
  customFields: { budget: 25_000_000 },
}

describe('contactAccessor', () => {
  it('resolves name to the contact full name', () => {
    expect(contactAccessor('name')(contact)).toBe('Maria Lopez')
  })

  it('reads custom fields through the custom prefix', () => {
    expect(contactAccessor('custom:budget')(contact)).toBe(25_000_000)
  })

  it('reads phone and whatsapp as plain properties', () => {
    expect(contactAccessor('phone')(contact)).toBe('+57 300 111 2233')
    expect(contactAccessor('whatsapp')(contact)).toBe('+57 300 444 5566')
  })

  it('reads createdAt as a plain property', () => {
    expect(contactAccessor('createdAt')(contact)).toBe('2026-08-14T15:00:00.000Z')
  })

  it('returns undefined for an unknown key', () => {
    expect(contactAccessor('missing')(contact)).toBeUndefined()
  })
})
