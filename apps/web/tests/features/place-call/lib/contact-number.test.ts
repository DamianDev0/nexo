import { DocumentType, LifecycleStage } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import type { ContactListItem } from '@repo/shared-types'

import { contactNumber } from '@/features/place-call/lib/contact-number'

const BASE: ContactListItem = {
  id: 'c1',
  firstName: 'Ana',
  lastName: 'Guerrero',
  email: 'ana@empresa.co',
  phone: '3001234567',
  whatsapp: null,
  documentType: DocumentType.CC,
  documentNumber: '1000324679',
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
  lifecycleStage: LifecycleStage.LEAD,
  source: null,
  type: null,
  typeLabel: null,
  leadScore: 50,
  dataConsent: true,
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
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  noteCount: 0,
}

describe('contactNumber', () => {
  it('prefers the phone number when present', () => {
    expect(contactNumber({ ...BASE, phone: '3001234567', whatsapp: '3109876543' })).toBe(
      '3001234567',
    )
  })

  it('falls back to whatsapp when phone is missing', () => {
    expect(contactNumber({ ...BASE, phone: null, whatsapp: '3109876543' })).toBe('3109876543')
  })

  it('returns null when the contact has no number', () => {
    expect(contactNumber({ ...BASE, phone: null, whatsapp: null })).toBeNull()
  })
})
