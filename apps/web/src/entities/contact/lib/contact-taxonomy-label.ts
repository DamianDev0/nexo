import type { TaxonomyChoice } from '@/entities/contact-taxonomy'

export function taxonomyLabel(
  map: ReadonlyMap<string, TaxonomyChoice>,
  key: string | null,
): string | null {
  if (!key) return null
  return map.get(key)?.label ?? key
}
