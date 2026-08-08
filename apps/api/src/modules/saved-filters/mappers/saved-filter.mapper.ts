import type { SavedFilter } from '@repo/shared-types'
import type { FilterRow } from '../interfaces/saved-filter-row.interfaces'

export function toSavedFilter(r: FilterRow): SavedFilter {
  return {
    id: r.id,
    userId: r.user_id,
    entityType: r.entity_type,
    name: r.name,
    filters: r.filters,
    isDefault: r.is_default,
    position: r.position,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}
