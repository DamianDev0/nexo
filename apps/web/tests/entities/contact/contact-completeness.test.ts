import { describe, expect, it } from 'vitest'

import { buildContact } from '../../msw/handlers'

import {
  missingContactFields,
  missingFieldsHint,
} from '@/entities/contact/lib/contact-completeness'

const t = ((key: string, options?: { fields?: string }) =>
  options?.fields ? `${key}:${options.fields}` : key) as never

describe('missingContactFields', () => {
  it('returns nothing for a complete contact', () => {
    expect(missingContactFields(buildContact({ whatsapp: null }))).toEqual([])
  })

  it('accepts whatsapp in place of a phone', () => {
    expect(missingContactFields(buildContact({ phone: null, whatsapp: '3001' }))).toEqual([])
  })

  it('lists every missing required field in order', () => {
    const contact = buildContact({ email: null, phone: null, whatsapp: null, documentNumber: null })
    expect(missingContactFields(contact)).toEqual(['email', 'phone', 'documentNumber'])
  })
})

describe('missingFieldsHint', () => {
  it('is null when nothing is missing', () => {
    expect(missingFieldsHint(t, [])).toBeNull()
  })

  it('joins the lower-cased field labels into the hint', () => {
    expect(missingFieldsHint(t, ['email', 'documentNumber'])).toBe(
      'contacts.completeness.missing:contacts.form.email, contacts.columns.documentnumber',
    )
  })
})
