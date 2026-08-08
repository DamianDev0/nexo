import type { ContactView } from '@repo/shared-types'
import type { ContactViewRow } from '../interfaces/contact-view-row.interfaces'

export function mapContactView(r: ContactViewRow): ContactView {
  return {
    id: r.id,
    ownerId: r.owner_id,
    name: r.name,
    filters: r.filters ?? {},
    advancedFilters: r.advanced_filters,
    columns: (r.columns ?? {}) as ContactView['columns'],
    sort: r.sort,
    density: r.density as ContactView['density'],
    isDefault: r.is_default,
    isFavorite: r.is_favorite,
    visibility: r.visibility as ContactView['visibility'],
    position: r.position,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}
