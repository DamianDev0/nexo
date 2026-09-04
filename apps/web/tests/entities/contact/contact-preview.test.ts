import { DocumentType, LifecycleStage } from '@repo/shared-types'
import { describe, expect, it } from 'vitest'

import type { ContactListItem } from '@repo/shared-types'

import { buildContactPreviewRows } from '@/entities/contact/lib/contact-preview'

const t = ((key: string) => key) as never

const BASE: ContactListItem = {
  id: 'c1',
  firstName: 'Ana',
  lastName: 'Guerrero',
  email: 'ana@empresa.co',
  phone: '3001234567',
  whatsapp: null,
  documentType: DocumentType.CC,
  documentNumber: '1000324679',
  jobTitle: 'Directora Comercial',
  linkedinUrl: null,
  birthday: null,
  address: 'Calle 100 #7-21',
  city: 'Medellín',
  department: 'Antioquia',
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
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  noteCount: 0,
}

describe('buildContactPreviewRows', () => {
  it('links email and phone rows to their actions', () => {
    const rows = buildContactPreviewRows(t, BASE)

    expect(rows.find((row) => row.key === 'email')?.href).toBe('mailto:ana@empresa.co')
    expect(rows.find((row) => row.key === 'phone')?.href).toBe('tel:+573001234567')
    expect(rows.find((row) => row.key === 'phone')?.value).toBe('+57 300 123 4567')
  })

  it('joins document type with number and city with department', () => {
    const rows = buildContactPreviewRows(t, BASE)

    expect(rows.find((row) => row.key === 'document')?.value).toBe('CC 1000324679')
    expect(rows.find((row) => row.key === 'city')?.value).toBe('Medellín, Antioquia')
  })

  it('leaves missing values as null without links', () => {
    const rows = buildContactPreviewRows(t, { ...BASE, whatsapp: null, address: null })

    const whatsapp = rows.find((row) => row.key === 'whatsapp')
    expect(whatsapp?.value).toBeNull()
    expect(whatsapp?.href).toBeUndefined()
    expect(rows.find((row) => row.key === 'address')?.value).toBeNull()
  })
})
