import { listQueryFilters } from '@/entities/contact'

import type { ContactListQuery } from '@repo/shared-types'

export function selectionScopeKey(query: ContactListQuery): string {
  return JSON.stringify(listQueryFilters(query))
}

export function collectTags(rows: ReadonlyArray<{ readonly tags: readonly string[] }>): string[] {
  const names = new Set<string>()
  for (const row of rows) for (const tag of row.tags) names.add(tag)
  return [...names]
}
