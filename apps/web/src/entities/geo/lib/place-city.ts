import { normalizeText } from '@repo/shared-utils'

import type { Municipality } from '@repo/shared-types'

export function extractCityFromPlace(secondaryText: string): string | null {
  const [first] = secondaryText.split(',').map((part) => part.trim())
  if (!first || normalizeText(first) === normalizeText('Colombia')) return null
  return first
}

export function pickMunicipality(
  city: string,
  municipalities: ReadonlyArray<Municipality>,
): Municipality | null {
  const target = normalizeText(city)
  return municipalities.find((m) => normalizeText(m.name) === target) ?? municipalities[0] ?? null
}
