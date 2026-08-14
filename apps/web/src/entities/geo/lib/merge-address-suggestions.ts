import { MAX_ADDRESS_OPTIONS } from '../config/address.constants'

import type { AddressSuggestion } from '@repo/shared-types'

export type AddressOption =
  | { readonly kind: 'via'; readonly value: string }
  | {
      readonly kind: 'place'
      readonly value: string
      readonly mainText: string
      readonly secondaryText: string
      readonly placeId: string
    }

export function mergeAddressSuggestions(
  viaTypes: ReadonlyArray<string>,
  places: ReadonlyArray<AddressSuggestion>,
): ReadonlyArray<AddressOption> {
  const viaOptions: AddressOption[] = viaTypes.map((value) => ({ kind: 'via', value }))

  const seen = new Set<string>()
  const placeOptions: AddressOption[] = []
  for (const place of places) {
    if (seen.has(place.description)) continue
    seen.add(place.description)
    placeOptions.push({
      kind: 'place',
      value: place.description,
      mainText: place.mainText,
      secondaryText: place.secondaryText,
      placeId: place.placeId,
    })
  }

  return [...viaOptions, ...placeOptions].slice(0, MAX_ADDRESS_OPTIONS)
}
