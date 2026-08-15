import { describe, expect, it } from 'vitest'

import type { ContactDuplicateMatch, ContactDuplicatePayload } from '@repo/shared-types'
import type { TFunction } from 'i18next'

import {
  duplicateFormField,
  duplicateMatchName,
  duplicateMessage,
} from '@/features/create-contact/lib/contact-duplicates'

const t = ((key: string, options?: { name?: string }) =>
  options?.name ? `${key}|${options.name}` : key) as TFunction

function match(overrides: Partial<ContactDuplicateMatch> = {}): ContactDuplicateMatch {
  return {
    id: 'contact-1',
    firstName: 'Maria',
    lastName: 'Lopez',
    email: 'maria@nexo.test',
    phone: '3001234567',
    documentNumber: null,
    field: 'email',
    ...overrides,
  }
}

function payload(overrides: Partial<ContactDuplicatePayload> = {}): ContactDuplicatePayload {
  return { severity: 'hard', field: 'email', matches: [match()], canForce: false, ...overrides }
}

describe('duplicateMatchName', () => {
  it('joins first and last name', () => {
    expect(duplicateMatchName(match())).toBe('Maria Lopez')
  })

  it('omits a null last name', () => {
    expect(duplicateMatchName(match({ lastName: null }))).toBe('Maria')
  })
})

describe('duplicateMessage', () => {
  it('maps each duplicate field to its i18n key', () => {
    expect(duplicateMessage(t, payload({ field: 'email' }))).toBe(
      'contacts.duplicates.emailTaken|Maria Lopez',
    )
    expect(duplicateMessage(t, payload({ field: 'documentNumber' }))).toBe(
      'contacts.duplicates.documentTaken|Maria Lopez',
    )
    expect(duplicateMessage(t, payload({ field: 'phone' }))).toBe(
      'contacts.duplicates.phoneMatch|Maria Lopez',
    )
    expect(duplicateMessage(t, payload({ field: 'name' }))).toBe(
      'contacts.duplicates.nameMatch|Maria Lopez',
    )
  })

  it('interpolates an empty name when there are no matches', () => {
    expect(duplicateMessage(t, payload({ matches: [] }))).toBe('contacts.duplicates.emailTaken')
  })
})

describe('duplicateFormField', () => {
  it('targets the matching form field', () => {
    expect(duplicateFormField('email')).toBe('email')
    expect(duplicateFormField('phone')).toBe('phone')
    expect(duplicateFormField('name')).toBe('firstName')
  })

  it('returns null for documentNumber because the form has no such field', () => {
    expect(duplicateFormField('documentNumber')).toBeNull()
  })
})
