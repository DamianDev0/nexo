import { describe, expect, it } from 'vitest'

import { extractCityFromPlace, pickMunicipality } from '@/entities/geo/lib/place-city'

const bogota = { code: '11001', name: 'Bogotá D.C.', departmentCode: '11', department: 'Bogotá' }
const medellin = { code: '05001', name: 'Medellín', departmentCode: '05', department: 'Antioquia' }

describe('extractCityFromPlace', () => {
  it('takes the first segment of the secondary text', () => {
    expect(extractCityFromPlace('Medellín, Antioquia, Colombia')).toBe('Medellín')
  })

  it('returns null when the secondary text is only the country', () => {
    expect(extractCityFromPlace('Colombia')).toBeNull()
  })

  it('returns null for an empty secondary text', () => {
    expect(extractCityFromPlace('')).toBeNull()
  })
})

describe('pickMunicipality', () => {
  it('prefers the accent-insensitive exact name match', () => {
    expect(pickMunicipality('medellin', [bogota, medellin])).toEqual(medellin)
  })

  it('falls back to the first result when nothing matches exactly', () => {
    expect(pickMunicipality('Bogota Norte', [bogota, medellin])).toEqual(bogota)
  })

  it('returns null when there are no candidates', () => {
    expect(pickMunicipality('Cali', [])).toBeNull()
  })
})
