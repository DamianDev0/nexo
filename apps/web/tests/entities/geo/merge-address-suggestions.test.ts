import { describe, expect, it } from 'vitest'

import { MAX_ADDRESS_OPTIONS } from '@/entities/geo/config/address.constants'
import { mergeAddressSuggestions } from '@/entities/geo/lib/merge-address-suggestions'

const place = (description: string, placeId = description) => ({
  description,
  mainText: description,
  secondaryText: 'Bogotá, Colombia',
  placeId,
})

describe('mergeAddressSuggestions', () => {
  it('puts vía-type suggestions before place predictions', () => {
    const result = mergeAddressSuggestions(['Carrera'], [place('Carrera 45 #26-85')])

    expect(result).toEqual([
      { kind: 'via', value: 'Carrera' },
      {
        kind: 'place',
        value: 'Carrera 45 #26-85',
        mainText: 'Carrera 45 #26-85',
        secondaryText: 'Bogotá, Colombia',
        placeId: 'Carrera 45 #26-85',
      },
    ])
  })

  it('deduplicates places sharing the same description', () => {
    const result = mergeAddressSuggestions(
      [],
      [place('Calle 10, Medellín', 'a'), place('Calle 10, Medellín', 'b')],
    )

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ kind: 'place', placeId: 'a' })
  })

  it('caps the merged list at the configured maximum', () => {
    const vias = ['Calle', 'Carrera', 'Avenida', 'Diagonal']
    const places = [place('p1'), place('p2'), place('p3'), place('p4')]

    const result = mergeAddressSuggestions(vias, places)

    expect(result).toHaveLength(MAX_ADDRESS_OPTIONS)
    expect(result.slice(0, vias.length).every((option) => option.kind === 'via')).toBe(true)
  })

  it('returns an empty list when both sources are empty', () => {
    expect(mergeAddressSuggestions([], [])).toEqual([])
  })
})
