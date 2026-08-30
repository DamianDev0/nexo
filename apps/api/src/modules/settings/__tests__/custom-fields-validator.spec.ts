import { BadRequestException } from '@nestjs/common'
import type { FieldDef } from '@repo/shared-types'
import {
  CustomFieldsValidator,
  validateCustomFields,
} from '../services/custom-fields-validator.service'
import type { TenantConfigService } from '../services/tenant-config.service'

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

  describe('update mode', () => {
    const defs = [
      def({ key: 'nit', type: 'text', required: true }),
      def({ key: 'score', type: 'number', min: 0, max: 100 }),
    ]

    it('skips required fields absent from the payload', () => {
      expect(() => validateCustomFields({ score: 50 }, defs, 'update')).not.toThrow()
      expect(() => validateCustomFields({}, defs, 'update')).not.toThrow()
    })

    it('rejects blanking a required field', () => {
      expect(() => validateCustomFields({ nit: null }, defs, 'update')).toThrow(BadRequestException)
      expect(() => validateCustomFields({ nit: '' }, defs, 'update')).toThrow(BadRequestException)
    })

    it('allows null to clear an optional field', () => {
      expect(() => validateCustomFields({ score: null }, defs, 'update')).not.toThrow()
    })

    it('allows null to purge an archived key but rejects real values on it', () => {
      expect(() => validateCustomFields({ legacy: null }, defs, 'update')).not.toThrow()
      expect(() => validateCustomFields({ legacy: 'x' }, defs, 'update')).toThrow(
        BadRequestException,
      )
      expect(() => validateCustomFields({ legacy: null }, defs, 'create')).toThrow(
        BadRequestException,
      )
    })

    it('still validates provided values and unknown keys', () => {
      expect(() => validateCustomFields({ score: 150 }, defs, 'update')).toThrow(
        BadRequestException,
      )
      expect(() => validateCustomFields({ ghost: 'x' }, defs, 'update')).toThrow(
        BadRequestException,
      )
    })
  })
})

describe('CustomFieldsValidator', () => {
  it('skips config lookup entirely when updating without custom fields', async () => {
    const config = {
      getCustomFields: jest.fn().mockRejectedValue(new Error('must not be called')),
    } as unknown as TenantConfigService
    const validator = new CustomFieldsValidator(config)

    await expect(validator.validate('t1', 'contacts', undefined, 'update')).resolves.toBeUndefined()
    expect(config.getCustomFields).not.toHaveBeenCalled()
  })

  it('still enforces required fields on create when values are missing', async () => {
    const config = {
      getCustomFields: jest.fn().mockResolvedValue({
        contacts: [def({ key: 'nit', type: 'text', required: true })],
        companies: [],
        deals: [],
      }),
    } as unknown as TenantConfigService
    const validator = new CustomFieldsValidator(config)

    await expect(validator.validate('t1', 'contacts', undefined)).rejects.toThrow(
      BadRequestException,
    )
  })
})
