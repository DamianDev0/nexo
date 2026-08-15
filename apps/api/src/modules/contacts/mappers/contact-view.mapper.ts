import { CONTACT_VIEW_DENSITIES, CONTACT_VIEW_VISIBILITIES } from '@repo/shared-types'
import type { ContactView } from '@repo/shared-types'
import type { ContactViewRow } from '../interfaces/contact-view-row.interfaces'
import { sanitizeContactViewColumns } from './contact-table-state.mapper'

function density(value: string): ContactView['density'] {
  return CONTACT_VIEW_DENSITIES.find((option) => option === value) ?? 'comfortable'
}

function visibility(value: string): ContactView['visibility'] {
  return CONTACT_VIEW_VISIBILITIES.find((option) => option === value) ?? 'private'
}

export function mapContactView(r: ContactViewRow): ContactView {
  return {
    id: r.id,
    ownerId: r.owner_id,
    name: r.name,
    filters: r.filters ?? {},
    advancedFilters: r.advanced_filters,
    columns: sanitizeContactViewColumns(r.columns),
    sort: r.sort,
    density: density(r.density),
    isDefault: r.is_default,
    isFavorite: r.is_favorite,
    visibility: visibility(r.visibility),
    position: r.position,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}
