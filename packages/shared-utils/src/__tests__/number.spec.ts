import { formatNumber } from '../number'

describe('formatNumber', () => {
  it('groups thousands with the Colombian separator by default', () => {
    expect(formatNumber(50000)).toBe('50.000')
    expect(formatNumber(1200)).toBe('1.200')
    expect(formatNumber(999)).toBe('999')
    expect(formatNumber(0)).toBe('0')
  })

  it('follows the requested locale and drops fractions', () => {
    expect(formatNumber(50000, 'en')).toBe('50,000')
    expect(formatNumber(1234.6, 'es')).toBe('1.235')
  })
})
