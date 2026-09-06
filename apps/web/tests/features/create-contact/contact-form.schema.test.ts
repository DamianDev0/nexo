import { describe, expect, it } from 'vitest'

import type { TFunction } from 'i18next'

import { CONTACT_FORM_DEFAULTS } from '@/features/create-contact/config/contact-form.constants'
import {
  buildContactSchema,
  resolveWhatsapp,
} from '@/features/create-contact/lib/contact-form.schema'

const t = ((key: string) => key) as TFunction

const payload = (overrides: Record<string, unknown> = {}) => ({
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
  avatarUrl: '',
  lifecycleStage: '',
  ...overrides,
})

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
      avatarUrl: '',
      lifecycleStage: '',
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
      avatarUrl: '',
      lifecycleStage: '',
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
      avatarUrl: '',
      lifecycleStage: '',
    })

    expect(result.success).toBe(true)
  })

  it('rejects a whitespace-only firstName', () => {
    expect(buildContactSchema(t).safeParse(payload({ firstName: '   ' })).success).toBe(false)
  })

  it('rejects an invalid Colombian phone with the translated message', () => {
    const result = buildContactSchema(t).safeParse(payload({ phone: '123' }))

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('contacts.errors.phoneInvalid')
    }
  })

  it('trims fields and normalizes phones to digits', () => {
    const result = buildContactSchema(t).safeParse(
      payload({
        lastName: '  Lopez  ',
        address: 'Calle 100 #7-21',
        phone: ' 300 123 4567 ',
        email: '  maria@nexo.test  ',
        city: '  Bogotá  ',
        municipioCode: ' 11001 ',
      }),
    )

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.lastName).toBe('Lopez')
      expect(result.data.phone).toBe('3001234567')
      expect(result.data.email).toBe('maria@nexo.test')
      expect(result.data.address).toBe('Calle 100 #7-21')
      expect(result.data.city).toBe('Bogotá')
      expect(result.data.municipioCode).toBe('11001')
    }
  })

  it('keeps the empty-form defaults stable', () => {
    expect(CONTACT_FORM_DEFAULTS).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      whatsapp: '',
      whatsappSameAsPhone: false,
      address: '',
      city: '',
      municipioCode: '',
      status: CONTACT_FORM_DEFAULTS.status,
      avatarUrl: '',
      source: '',
      lifecycleStage: '',
    })
    expect(CONTACT_FORM_DEFAULTS.status).toBe('')
  })

  it('keeps the email value verbatim through the transform', () => {
    const filled = buildContactSchema(t).safeParse(payload({ email: 'maria@nexo.test' }))
    const empty = buildContactSchema(t).safeParse(payload())

    expect(filled.success && filled.data.email).toBe('maria@nexo.test')
    expect(empty.success && empty.data.email).toBe('')
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
      avatarUrl: '',
      lifecycleStage: '',
    })

    expect(result.success).toBe(true)
  })
})

describe('resolveWhatsapp', () => {
  it('returns the phone when whatsapp mirrors it', () => {
    const values = { ...CONTACT_FORM_DEFAULTS, phone: '3001112233', whatsappSameAsPhone: true }

    expect(resolveWhatsapp(values)).toBe('3001112233')
  })

  it('returns the dedicated whatsapp otherwise', () => {
    const values = { ...CONTACT_FORM_DEFAULTS, whatsapp: '3009998877' }

    expect(resolveWhatsapp(values)).toBe('3009998877')
  })
})
