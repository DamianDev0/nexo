import {
  canonicalAddressType,
  formatCOAddress,
  normalizeCOAddress,
  parseCOAddress,
  suggestAddressTypes,
} from '../address-co'

describe('canonicalAddressType', () => {
  it('resolves the abbreviations people actually type', () => {
    expect(canonicalAddressType('cll')).toBe('Calle')
    expect(canonicalAddressType('CRA')).toBe('Carrera')
    expect(canonicalAddressType('kra')).toBe('Carrera')
    expect(canonicalAddressType('dg')).toBe('Diagonal')
  })

  it('ignores accents on kilometro', () => {
    expect(canonicalAddressType('kilómetro')).toBe('Kilómetro')
  })

  it('returns null for something that is not a street type', () => {
    expect(canonicalAddressType('banana')).toBeNull()
  })
})

describe('suggestAddressTypes', () => {
  it('suggests by prefix as the user types', () => {
    expect(suggestAddressTypes('c')).toContain('Calle')
    expect(suggestAddressTypes('cr')).toContain('Carrera')
    expect(suggestAddressTypes('tv')).toEqual(['Transversal'])
  })
})

describe('parseCOAddress', () => {
  it('reads a full Colombian address', () => {
    expect(parseCOAddress('cra 45 #123-67')).toEqual({
      type: 'Carrera',
      main: '45',
      secondary: '123',
      number: '67',
      detail: '',
    })
  })

  it('keeps the trailing detail', () => {
    expect(parseCOAddress('calle 100 #7-21 apto 502')?.detail).toBe('apto 502')
  })

  it('handles letter suffixes like 45B', () => {
    expect(parseCOAddress('cll 45B #12-30')?.main).toBe('45B')
  })
})

describe('normalizeCOAddress', () => {
  it('canonicalizes what the user typed', () => {
    expect(normalizeCOAddress('cra 45 #123-67')).toBe('Carrera 45 #123-67')
    expect(normalizeCOAddress('CLL 100 no 7-21')).toBe('Calle 100 #7-21')
  })

  it('leaves an unrecognized address untouched', () => {
    expect(normalizeCOAddress('Finca La Esperanza')).toBe('Finca La Esperanza')
  })
})

describe('formatCOAddress', () => {
  it('drops the empty pieces', () => {
    expect(
      formatCOAddress({ type: 'Calle', main: '45', secondary: '', number: '', detail: '' }),
    ).toBe('Calle 45')
  })
})
