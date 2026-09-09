import { DocumentType, LifecycleStage } from '@repo/shared-types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ContactListItem } from '@repo/shared-types'

import { applyStatus } from '@/features/change-contact-status/lib/apply-status'

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
  isActive: true,
  createdById: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  noteCount: 0,
  optedOutChannels: [],
  nextActivity: null,
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-04T10:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('applyStatus', () => {
  it('replaces the status and stamps statusChangedAt with the current instant', () => {
    const patched = applyStatus(BASE, { id: 'c1', status: 'qualified' })

    expect(patched.status).toBe('qualified')
    expect(patched.statusChangedAt).toBe('2026-09-04T10:00:00.000Z')
  })

  it('keeps every other field intact and does not mutate the input', () => {
    const patched = applyStatus(BASE, { id: 'c1', status: 'qualified' })

    expect(patched).not.toBe(BASE)
    expect(BASE.status).toBe('new')
    expect(BASE.statusChangedAt).toBeNull()
    const { status: _status, statusChangedAt: _changed, ...rest } = patched
    const { status: _s, statusChangedAt: _c, ...original } = BASE
    expect(rest).toEqual(original)
  })
})
