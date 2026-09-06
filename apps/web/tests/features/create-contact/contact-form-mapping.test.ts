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

  it('stores the address as the address system field', () => {
    const input = toInput({ ...VALUES, address: 'Calle 100 #7-21' }, { eps: 'Sura' })

    expect(input.customFields).toEqual({ eps: 'Sura', address: 'Calle 100 #7-21' })
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
      city: null,
      municipioCode: null,
      status: 'new',
      statusChangedAt: null,
      avatarUrl: null,
      lifecycleStage: 'lead',
      source: null,
      lastContactedAt: null,
      tags: [],
      companyId: null,
      assignedToId: null,
      isActive: true,
      createdById: null,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      noteCount: 0,
      optedOutChannels: [],
      customFields: { address: 'Carrera 7 #1-1' },
    } satisfies ContactListItem

    const values = toFormValues(contact)

    expect(values.firstName).toBe('Maria')
    expect(values.whatsappSameAsPhone).toBe(true)
    expect(values.status).toBe('new')
    expect(values.lifecycleStage).toBe('lead')
    expect(values.address).toBe('Carrera 7 #1-1')
  })
})
