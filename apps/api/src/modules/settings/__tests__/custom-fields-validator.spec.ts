import { BadRequestException } from '@nestjs/common'
import type { FieldDef } from '@repo/shared-types'
import { validateCustomFields } from '../services/custom-fields-validator.service'

function def(partial: Partial<FieldDef> & Pick<FieldDef, 'key' | 'type'>): FieldDef {
  return {
    label: partial.key,
    required: false,
    unique: false,
    order: 0,
    ...partial,
  }
}

describe('validateCustomFields', () => {
  it('passes when values match the field defs', () => {
    const defs = [
      def({ key: 'nps', type: 'number', min: 0, max: 10 }),
      def({ key: 'vip', type: 'boolean' }),
    ]
    expect(() => validateCustomFields({ nps: 9, vip: true }, defs)).not.toThrow()
  })

  it('rejects unknown fields', () => {
    expect(() => validateCustomFields({ ghost: 'x' }, [])).toThrow(BadRequestException)
  })

  it('enforces required fields', () => {
    const defs = [def({ key: 'nit', type: 'text', required: true })]
    expect(() => validateCustomFields({}, defs)).toThrow(BadRequestException)
    expect(() => validateCustomFields({ nit: '900123' }, defs)).not.toThrow()
  })

  it('enforces number type and min/max bounds', () => {
    const defs = [def({ key: 'score', type: 'number', min: 0, max: 100 })]
    expect(() => validateCustomFields({ score: 'high' }, defs)).toThrow(BadRequestException)
    expect(() => validateCustomFields({ score: 150 }, defs)).toThrow(BadRequestException)
    expect(() => validateCustomFields({ score: 50 }, defs)).not.toThrow()
  })

  it('enforces select options', () => {
    const defs = [def({ key: 'tier', type: 'select', options: [{ value: 'gold', label: 'Gold' }] })]
    expect(() => validateCustomFields({ tier: 'platinum' }, defs)).toThrow(BadRequestException)
    expect(() => validateCustomFields({ tier: 'gold' }, defs)).not.toThrow()
  })

  it('validates email and date formats', () => {
    const defs = [def({ key: 'contact', type: 'email' }), def({ key: 'renews', type: 'date' })]
    expect(() => validateCustomFields({ contact: 'nope', renews: '2026-01-01' }, defs)).toThrow(
      BadRequestException,
    )
    expect(() => validateCustomFields({ contact: 'a@b.co', renews: 'not-a-date' }, defs)).toThrow(
      BadRequestException,
    )
    expect(() =>
      validateCustomFields({ contact: 'a@b.co', renews: '2026-01-01' }, defs),
    ).not.toThrow()
  })

  it('validates phone fields with the Colombian rule', () => {
    const defs = [def({ key: 'telefono_2', type: 'phone' })]
    expect(() => validateCustomFields({ telefono_2: '42y73726232736723672' }, defs)).toThrow(
      BadRequestException,
    )
    expect(() => validateCustomFields({ telefono_2: '300 123 4567' }, defs)).not.toThrow()
  })

  it('validates url fields', () => {
    const defs = [def({ key: 'sitio', type: 'url' })]
    expect(() => validateCustomFields({ sitio: 'nexo' }, defs)).toThrow(BadRequestException)
    expect(() => validateCustomFields({ sitio: 'https://nexo.co' }, defs)).not.toThrow()
  })

  it('enforces relation fields to be UUIDs', () => {
    const defs = [def({ key: 'account', type: 'relation', relationEntity: 'companies' })]
    expect(() => validateCustomFields({ account: 'not-a-uuid' }, defs)).toThrow(BadRequestException)
    expect(() =>
      validateCustomFields({ account: '550e8400-e29b-41d4-a716-446655440000' }, defs),
    ).not.toThrow()
  })

  it('rejects setting a computed formula field', () => {
    const defs = [def({ key: 'total', type: 'formula', formula: 'a+b' })]
    expect(() => validateCustomFields({ total: 5 }, defs)).toThrow(BadRequestException)
  })

  it('ignores absent optional fields', () => {
    const defs = [def({ key: 'note', type: 'text' })]
    expect(() => validateCustomFields({}, defs)).not.toThrow()
  })
})
