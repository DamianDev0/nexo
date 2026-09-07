import { describe, expect, it } from 'vitest'

import { buildContact } from '../../msw/handlers'

import { applyOwner } from '@/features/assign-contact-owner/lib/apply-owner'

describe('applyOwner', () => {
  it('assigns the owner id and display name', () => {
    const next = applyOwner(buildContact(), { id: 'c1', assignedToId: 'u1', assignedToName: 'Ana' })
    expect(next.assignedToId).toBe('u1')
    expect(next.assignedToName).toBe('Ana')
  })

  it('clears both fields on unassign', () => {
    const contact = buildContact({ assignedToId: 'u1', assignedToName: 'Ana' })
    const next = applyOwner(contact, { id: 'c1', assignedToId: null, assignedToName: null })
    expect(next.assignedToId).toBeNull()
    expect(next.assignedToName).toBeNull()
  })
})
