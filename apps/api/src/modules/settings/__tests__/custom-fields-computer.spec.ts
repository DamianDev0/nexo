import type { FieldDef } from '@repo/shared-types'
import { computeFormulaFields } from '../services/custom-fields-computer.service'

function def(partial: Partial<FieldDef> & Pick<FieldDef, 'key' | 'type'>): FieldDef {
  return { label: partial.key, required: false, unique: false, order: 0, ...partial }
}

describe('computeFormulaFields', () => {
  it('computes a formula field from other numeric custom fields', () => {
    const defs = [
      def({ key: 'price', type: 'currency' }),
      def({ key: 'quantity', type: 'number' }),
      def({ key: 'total', type: 'formula', formula: 'price * quantity' }),
    ]
    const result = computeFormulaFields({ price: 100, quantity: 3 }, defs)
    expect(result.total).toBe(300)
  })

  it('returns the original object when there are no formula fields', () => {
    const defs = [def({ key: 'price', type: 'currency' })]
    const values = { price: 100 }
    expect(computeFormulaFields(values, defs)).toBe(values)
  })

  it('sets a formula field to null when inputs are missing', () => {
    const defs = [
      def({ key: 'price', type: 'currency' }),
      def({ key: 'total', type: 'formula', formula: 'price * quantity' }),
    ]
    const result = computeFormulaFields({ price: 100 }, defs)
    expect(result.total).toBeNull()
  })

  it('does not mutate the input values', () => {
    const defs = [
      def({ key: 'a', type: 'number' }),
      def({ key: 'double', type: 'formula', formula: 'a * 2' }),
    ]
    const values = { a: 5 }
    computeFormulaFields(values, defs)
    expect(values).toEqual({ a: 5 })
  })
})
