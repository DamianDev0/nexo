import { suggestAddressTypes } from '@repo/shared-utils'

import { MAX_ADDRESS_SUGGESTIONS } from '../config/address.constants'

export function buildAddressSuggestions(value: string): ReadonlyArray<string> {
  const trimmed = value.trimStart()
  const token = trimmed.split(' ')[0] ?? ''
  if (!token || trimmed.includes(' ')) return []
  return suggestAddressTypes(token).slice(0, MAX_ADDRESS_SUGGESTIONS)
}
