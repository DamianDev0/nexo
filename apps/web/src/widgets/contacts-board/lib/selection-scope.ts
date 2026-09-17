import { listQueryFilters } from '@/entities/contact'

import type { ContactListQuery } from '@repo/shared-types'

export function selectionScopeKey(query: ContactListQuery): string {
  return JSON.stringify(listQueryFilters(query))
}
