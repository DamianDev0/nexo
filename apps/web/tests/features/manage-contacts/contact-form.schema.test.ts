import { ContactStatus } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import type { TFunction } from 'i18next'

import { buildContactSchema } from '@/features/manage-contacts/model/contact-form.schema'

const t = ((key: string) => key) as TFunction

describe('buildContactSchema', () => {
  it('requires firstName', () => {
    const result = buildContactSchema(t).safeParse({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      whatsapp: '',
      city: '',
      status: ContactStatus.NEW,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('contacts.errors.firstNameRequired')
    }
  })

  it('rejects an invalid email', () => {
    const result = buildContactSchema(t).safeParse({
      firstName: 'Maria',
      lastName: '',
      email: 'not-an-email',
      phone: '',
      whatsapp: '',
      city: '',
      status: ContactStatus.NEW,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('contacts.errors.emailInvalid')
    }
  })

  it('accepts an empty email', () => {
    const result = buildContactSchema(t).safeParse({
      firstName: 'Maria',
      lastName: '',
      email: '',
      phone: '',
      whatsapp: '',
      city: '',
      status: ContactStatus.NEW,
    })

    expect(result.success).toBe(true)
  })

  it('accepts a valid full payload', () => {
    const result = buildContactSchema(t).safeParse({
      firstName: 'Maria',
      lastName: 'Lopez',
      email: 'maria@nexo.test',
      phone: '+57 300 000 0000',
      whatsapp: '+57 300 000 0000',
      city: 'Bogota',
      status: ContactStatus.QUALIFIED,
    })

    expect(result.success).toBe(true)
  })
})
