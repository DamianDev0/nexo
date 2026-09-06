import { DocumentType, LifecycleStage } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import type { ContactListItem } from '@repo/shared-types'

import { applyCustomFields } from '@/features/edit-contact-field/lib/apply-custom-fields'

const BASE: ContactListItem = {
  id: 'c1',
  firstName: 'Ana',
  lastName: 'Guerrero',
  email: 'ana@empresa.co',
  phone: '3001234567',
  whatsapp: null,
  documentType: DocumentType.CC,
  documentNumber: '1000324679',
  city: 'Medellín',
  municipioCode: null,
  status: 'new',
  statusChangedAt: null,
  avatarUrl: null,
  lifecycleStage: LifecycleStage.LEAD,
  source: null,
  lastContactedAt: null,
  tags: [],
  companyId: null,
  assignedToId: null,
  customFields: { sector: 'retail', empleados: 12 },
  isActive: true,
  createdById: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  noteCount: 0,
  optedOutChannels: [],
}

describe('applyCustomFields', () => {
  it('replaces customFields with the incoming map', () => {
    const patched = applyCustomFields(BASE, { id: 'c1', customFields: { sector: 'salud' } })

    expect(patched.customFields).toEqual({ sector: 'salud' })
  })

  it('keeps every other field intact and does not mutate the input', () => {
    const patched = applyCustomFields(BASE, { id: 'c1', customFields: {} })

    expect(patched).not.toBe(BASE)
    expect(BASE.customFields).toEqual({ sector: 'retail', empleados: 12 })
    const { customFields: _patched, ...rest } = patched
    const { customFields: _original, ...expected } = BASE
    expect(rest).toEqual(expected)
  })
})
