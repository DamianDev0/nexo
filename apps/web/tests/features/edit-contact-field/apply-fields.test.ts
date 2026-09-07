import { describe, expect, it } from 'vitest'

import { buildContact } from '../../msw/handlers'

import { applyFields } from '@/features/edit-contact-field/lib/apply-fields'

describe('applyFields', () => {
  it('merges the patched columns over the contact', () => {
    const next = applyFields(buildContact({ city: 'Bogota' }), {
      id: 'c1',
      patch: { city: 'Medellín', email: 'ana@nexo.co' },
    })
    expect(next.city).toBe('Medellín')
    expect(next.email).toBe('ana@nexo.co')
    expect(next.firstName).toBe('Maria')
  })
})
