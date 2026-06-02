import { evaluateFormula } from '../formula.util'

describe('evaluateFormula', () => {
  it('respects operator precedence', () => {
    expect(evaluateFormula('2 + 3 * 4', {})).toBe(14)
  })

  it('respects parentheses', () => {
    expect(evaluateFormula('(2 + 3) * 4', {})).toBe(20)
  })

  it('resolves numeric field references', () => {
    expect(evaluateFormula('price * quantity', { price: 10, quantity: 3 })).toBe(30)
  })

  it('supports unary minus and decimals', () => {
    expect(evaluateFormula('-5 + 2.5', {})).toBe(-2.5)
  })

  it('supports functions', () => {
    expect(evaluateFormula('round(price * 1.19)', { price: 100 })).toBe(119)
    expect(evaluateFormula('max(a, b, 5)', { a: 2, b: 9 })).toBe(9)
    expect(evaluateFormula('min(a, b)', { a: 2, b: 9 })).toBe(2)
  })

  it('returns null on division by zero', () => {
    expect(evaluateFormula('10 / 0', {})).toBeNull()
  })

  it('returns null for missing or non-numeric fields', () => {
    expect(evaluateFormula('price * quantity', { price: 10 })).toBeNull()
  })

  it('returns null on bad syntax', () => {
    expect(evaluateFormula('2 +', {})).toBeNull()
    expect(evaluateFormula('(2 + 3', {})).toBeNull()
    expect(evaluateFormula('2 3', {})).toBeNull()
  })

  it('returns null on empty input', () => {
    expect(evaluateFormula('', {})).toBeNull()
    expect(evaluateFormula('   ', {})).toBeNull()
  })

  it('does not execute injected code (no eval)', () => {
    expect(evaluateFormula('process.exit(1)', {})).toBeNull()
    expect(evaluateFormula('1; console.log("x")', {})).toBeNull()
  })
})
