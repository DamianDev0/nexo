import { toBogotaDayKey } from '../date-co'

describe('toBogotaDayKey', () => {
  it('shifts UTC instants into the Bogota calendar day', () => {
    expect(toBogotaDayKey('2026-09-08T03:30:00.000Z')).toBe('2026-09-07')
    expect(toBogotaDayKey('2026-09-08T05:00:00.000Z')).toBe('2026-09-08')
    expect(toBogotaDayKey(new Date('2026-12-31T23:59:00-05:00'))).toBe('2026-12-31')
  })
})
