import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { buildContact } from '../../msw/handlers'

import {
  applyCustomFields,
  applyFields,
  applyOwner,
  applyStatus,
  applyTags,
  isSameRecord,
} from '@/features/edit-record-field/lib/apply-record-patch'

const BASE = buildContact({
  id: 'c1',
  status: 'new',
  statusChangedAt: null,
  customFields: { sector: 'retail', empleados: 12 },
})

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-04T10:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('isSameRecord', () => {
  it('matches only the record the change targets', () => {
    expect(isSameRecord(BASE, { id: 'c1' })).toBe(true)
    expect(isSameRecord(BASE, { id: 'c2' })).toBe(false)
  })
})

describe('applyFields', () => {
  it('merges the patched columns over the record without mutating it', () => {
    const next = applyFields(BASE, { id: 'c1', patch: { city: 'Medellín', email: 'ana@nexo.co' } })

    expect(next.city).toBe('Medellín')
    expect(next.email).toBe('ana@nexo.co')
    expect(next.firstName).toBe(BASE.firstName)
    expect(next).not.toBe(BASE)
  })
})

describe('applyCustomFields', () => {
  it('merges the edited key over the stored ones, like the jsonb merge on the server', () => {
    const patched = applyCustomFields(BASE, { id: 'c1', customFields: { sector: 'salud' } })

    expect(patched.customFields).toEqual({ sector: 'salud', empleados: 12 })
  })

  it('drops keys cleared with null so the optimistic row matches the server', () => {
    const patched = applyCustomFields(BASE, { id: 'c1', customFields: { sector: null } })

    expect(patched.customFields).toEqual({ empleados: 12 })
    expect(BASE.customFields).toEqual({ sector: 'retail', empleados: 12 })
  })
})

describe('applyStatus', () => {
  it('replaces the status and stamps statusChangedAt with the current instant', () => {
    const patched = applyStatus(BASE, { id: 'c1', status: 'qualified' })

    expect(patched.status).toBe('qualified')
    expect(patched.statusChangedAt).toBe('2026-09-04T10:00:00.000Z')
    expect(BASE.status).toBe('new')
  })
})

describe('applyOwner', () => {
  it('assigns the owner id and display name', () => {
    const next = applyOwner(BASE, { id: 'c1', assignedToId: 'u1', assignedToName: 'Ana' })

    expect(next.assignedToId).toBe('u1')
    expect(next.assignedToName).toBe('Ana')
  })

  it('clears both fields on unassign', () => {
    const owned = applyOwner(BASE, { id: 'c1', assignedToId: 'u1', assignedToName: 'Ana' })
    const next = applyOwner(owned, { id: 'c1', assignedToId: null, assignedToName: null })

    expect(next.assignedToId).toBeNull()
    expect(next.assignedToName).toBeNull()
  })
})

describe('applyTags', () => {
  it('replaces the tags with a copy of the selection', () => {
    const selection = ['VIP', 'Lead frío']
    const next = applyTags(BASE, { id: 'c1', tags: selection })

    expect(next.tags).toEqual(['VIP', 'Lead frío'])
    expect(next.tags).not.toBe(selection)
  })
})
