import { describe, expect, it } from 'vitest'

import { buildContact } from '../../msw/handlers'

import {
  buildAddressCustomFields,
  buildContactDetailsSchema,
  buildDetailsPatch,
  contactDetailsDefaults,
} from '@/features/preview-contact/lib/contact-details-form.schema'

const t = ((key: string) => key) as never

describe('contactDetailsDefaults', () => {
  it('maps nullable columns and the address custom field to strings', () => {
    const defaults = contactDetailsDefaults(
      buildContact({ email: null, city: null, source: null, customFields: { address: 'Cl 1' } }),
    )
    expect(defaults.email).toBe('')
    expect(defaults.city).toBe('')
    expect(defaults.source).toBe('')
    expect(defaults.address).toBe('Cl 1')
    expect(defaults.firstName).toBe('Maria')
  })
})

describe('buildContactDetailsSchema', () => {
  const schema = buildContactDetailsSchema(t)

  it('requires a first name and validates email and phone', () => {
    const base = contactDetailsDefaults(buildContact({ phone: null }))
    expect(schema.safeParse({ ...base, firstName: ' ' }).success).toBe(false)
    expect(schema.safeParse({ ...base, email: 'bad' }).success).toBe(false)
    expect(schema.safeParse({ ...base, phone: '12' }).success).toBe(false)
    expect(schema.safeParse({ ...base, phone: '300 123 4567' }).success).toBe(true)
  })
})

describe('buildDetailsPatch', () => {
  it('returns null when the value did not change', () => {
    const contact = buildContact({ city: 'Bogota' })
    expect(buildDetailsPatch('city', contactDetailsDefaults(contact), contact)).toBeNull()
  })

  it('returns a single-column patch when it changed', () => {
    const contact = buildContact({ city: 'Bogota' })
    const values = { ...contactDetailsDefaults(contact), email: 'new@nexo.co' }
    expect(buildDetailsPatch('email', values, contact)).toEqual({ email: 'new@nexo.co' })
  })

  it('saves the municipality code together with the city', () => {
    const contact = buildContact({ city: 'Bogota', municipioCode: '11001' })
    const values = { ...contactDetailsDefaults(contact), city: 'Cali', municipioCode: '76001' }
    expect(buildDetailsPatch('city', values, contact)).toEqual({
      city: 'Cali',
      municipioCode: '76001',
    })
  })
})

describe('buildAddressCustomFields', () => {
  it('merges the address into the existing custom fields', () => {
    const contact = buildContact({ customFields: { role: 'CEO' } })
    expect(buildAddressCustomFields(contact, 'Cl 100 #7-21')).toEqual({
      role: 'CEO',
      address: 'Cl 100 #7-21',
    })
  })

  it('returns null when the address is unchanged', () => {
    const contact = buildContact({ customFields: { address: 'Cl 1' } })
    expect(buildAddressCustomFields(contact, 'Cl 1')).toBeNull()
  })
})

describe('clearing a field from the drawer', () => {
  it('sends null instead of an empty string so the API accepts the clear', () => {
    const contact = buildContact({ lastName: 'Jiménez', city: 'Cali', municipioCode: '76001' })
    const values = { ...contactDetailsDefaults(contact), lastName: '' }

    expect(buildDetailsPatch('lastName', values, contact)).toEqual({ lastName: null })
  })

  it('clears the municipality code alongside the city', () => {
    const contact = buildContact({ city: 'Cali', municipioCode: '76001' })
    const values = { ...contactDetailsDefaults(contact), city: '', municipioCode: '' }

    expect(buildDetailsPatch('city', values, contact)).toEqual({ city: null, municipioCode: null })
  })

  it('still returns null when nothing actually changed', () => {
    const contact = buildContact({ lastName: 'Jiménez' })
    const values = contactDetailsDefaults(contact)

    expect(buildDetailsPatch('lastName', values, contact)).toBeNull()
  })
})
