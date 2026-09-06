import { mapContact, mapContactListItem } from '../mappers/contact.mapper'

import type { ContactRow } from '../interfaces/contact-row.interfaces'

const baseRow = {
  id: 'c1',
  first_name: 'Ana',
  last_name: 'Rojas',
  email: 'ana@empresa.co',
  phone: '3001234567',
  whatsapp: null,
  document_type: 'CC',
  document_number: '1000324679',
  city: 'Medellín',
  municipio_code: '05001',
  status: 'new',
  source: 'web',
  tags: [],
  company_id: null,
  assigned_to_id: null,
  custom_fields: { birthday: '1990-04-15' },
  is_active: true,
  created_by: 'u1',
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
} as unknown as ContactRow

describe('mapContactListItem', () => {
  it('maps note_count into noteCount and defaults it to zero', () => {
    expect(mapContactListItem({ ...baseRow, note_count: 3 }).noteCount).toBe(3)
    expect(mapContactListItem(baseRow).noteCount).toBe(0)
  })

  it('exposes revoked consent channels and defaults to none', () => {
    expect(
      mapContactListItem({ ...baseRow, opted_out_channels: ['email', 'sms'] }).optedOutChannels,
    ).toEqual(['email', 'sms'])
    expect(mapContactListItem(baseRow).optedOutChannels).toEqual([])
  })
})

describe('mapContact', () => {
  it('never carries noteCount — detail queries do not select it', () => {
    const contact = mapContact({ ...baseRow, note_count: 3 })

    expect('noteCount' in contact).toBe(false)
    expect(contact.customFields).toEqual({ birthday: '1990-04-15' })
  })
})
