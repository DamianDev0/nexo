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
      whatsappSameAsPhone: false,
      address: '',
      city: '',
      municipioCode: '',
      source: '',
      status: 'new',
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
      whatsappSameAsPhone: false,
      address: '',
      city: '',
      municipioCode: '',
      source: '',
      status: 'new',
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
      whatsappSameAsPhone: false,
      address: '',
      city: '',
      municipioCode: '',
      source: '',
      status: 'new',
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
      whatsappSameAsPhone: false,
      address: 'Calle 100 #7-21',
      city: 'Bogota',
      municipioCode: '11001',
      source: '',
      status: 'qualified',
    })

    expect(result.success).toBe(true)
  })
})
