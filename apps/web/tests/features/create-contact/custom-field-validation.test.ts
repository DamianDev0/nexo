import { describe, expect, it } from 'vitest'

import type { FieldDef } from '@repo/shared-types'
import type { TFunction } from 'i18next'

import {
  customFieldError,
  validateCustomValues,
} from '@/features/create-contact/lib/custom-field-validation'

const t = ((key: string) => key) as TFunction

function field(overrides: Partial<FieldDef> = {}): FieldDef {
  return {
    key: 'telefono_2',
    label: 'Teléfono secundario',
    type: 'phone',
    required: false,
    unique: false,
    order: 1,
    ...overrides,
  }
}

describe('customFieldError', () => {
  it('rejects a phone with letters using the shared Colombian rule', () => {
    expect(customFieldError(field(), '42y73726232736723672', t)).toBe(
      'contacts.errors.phoneInvalid',
    )
  })

  it('accepts a valid Colombian mobile with formatting noise', () => {
    expect(customFieldError(field(), '300 123 4567', t)).toBeNull()
  })

  it('validates email and url types', () => {
    expect(customFieldError(field({ type: 'email' }), 'no-es-email', t)).toBe(
      'contacts.errors.emailInvalid',
    )
    expect(customFieldError(field({ type: 'email' }), 'ana@nexo.co', t)).toBeNull()
    expect(customFieldError(field({ type: 'url' }), 'nexo', t)).toBe('contacts.errors.urlInvalid')
    expect(customFieldError(field({ type: 'url' }), 'https://nexo.co', t)).toBeNull()
  })

  it('requires a value only when the field is required', () => {
    expect(customFieldError(field({ required: true }), '', t)).toBe(
      'contacts.errors.customRequired',
    )
    expect(customFieldError(field(), '', t)).toBeNull()
  })

  it('rejects non-numeric values on number and currency', () => {
    expect(customFieldError(field({ type: 'number' }), 'abc', t)).toBe(
      'contacts.errors.numberInvalid',
    )
    expect(customFieldError(field({ type: 'currency' }), 8_500_000_000, t)).toBeNull()
  })
})

describe('validateCustomValues', () => {
  it('collects one error per invalid field', () => {
    const defs = [
      field(),
      field({ key: 'email_2', type: 'email' }),
      field({ key: 'nota', type: 'text', required: true }),
    ]

    const errors = validateCustomValues(defs, { telefono_2: 'xx', email_2: 'bad' }, t)

    expect(Object.keys(errors).sort()).toEqual(['email_2', 'nota', 'telefono_2'])
  })

  it('returns empty for a valid payload', () => {
    expect(validateCustomValues([field()], { telefono_2: '3001234567' }, t)).toEqual({})
  })
})
