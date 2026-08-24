import { describe, expect, it } from 'vitest'

import type { ContactFormValues } from '@/features/create-contact/lib/contact-form.schema'
import type { ContactListItem } from '@repo/shared-types'

import { toFormValues, toInput } from '@/features/create-contact/lib/contact-form-mapping'

const VALUES: ContactFormValues = {
  firstName: 'Ana',
  lastName: '',
  email: 'ana@empresa.co',
  phone: '3001234567',
  whatsapp: '',
  whatsappSameAsPhone: true,
  address: '',
  city: 'Bogotá',
  municipioCode: '',
  status: 'new',
  avatarUrl: '',
  source: '',
  type: '',
  typeLabel: '',
  lifecycleStage: 'lead',
}

describe('toInput', () => {
  it('omits customFields when the record is empty', () => {
    expect(toInput(VALUES, {}).customFields).toBeUndefined()
  })

  it('includes customFields when values are present', () => {
    const input = toInput(VALUES, { metros_cuadrados: 120 })

    expect(input.customFields).toEqual({ metros_cuadrados: 120 })
    expect(input.firstName).toBe('Ana')
  })

  it('sends the lifecycle stage only when set', () => {
    expect(toInput(VALUES, {}).lifecycleStage).toBe('lead')
    expect(toInput({ ...VALUES, lifecycleStage: '' }, {}).lifecycleStage).toBeUndefined()
  })
})

describe('toFormValues', () => {
  it('maps a contact into editable form values', () => {
    const contact = {
      id: 'c-1',
      firstName: 'Maria',
      lastName: 'Lopez',
      email: null,
      phone: '3000000000',
      whatsapp: '3000000000',
      documentType: null,
      documentNumber: null,
      jobTitle: null,
      linkedinUrl: null,
      birthday: null,
      address: null,
      city: null,
      department: null,
      municipioCode: null,
      country: 'CO',
      status: 'new',
      statusChangedAt: null,
      avatarUrl: null,
      lifecycleStage: 'lead',
      source: null,
      type: null,
      typeLabel: null,
      leadScore: 0,
      dataConsent: false,
      consentDate: null,
      consentSource: null,
      optOutEmail: false,
      optOutSms: false,
      optOutWhatsapp: false,
      lastContactedAt: null,
      tags: [],
      companyId: null,
      assignedToId: null,
      isActive: true,
      createdById: null,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    } satisfies ContactListItem

    const values = toFormValues(contact)

    expect(values.firstName).toBe('Maria')
    expect(values.whatsappSameAsPhone).toBe(true)
    expect(values.status).toBe('new')
    expect(values.lifecycleStage).toBe('lead')
  })
})
