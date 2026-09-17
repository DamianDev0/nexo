import { OBJECT_VIEW_DENSITIES, OBJECT_VIEW_VISIBILITIES } from '@repo/shared-types'
import type { ObjectView } from '@repo/shared-types'
import type { ObjectViewRow } from '../interfaces/object-view-row.interfaces'
import { sanitizeViewColumns, type ColumnMinWidths } from './object-table-state.mapper'

function density(value: string): ObjectView['density'] {
  return OBJECT_VIEW_DENSITIES.find((option) => option === value) ?? 'comfortable'
}

function visibility(value: string): ObjectView['visibility'] {
  return OBJECT_VIEW_VISIBILITIES.find((option) => option === value) ?? 'private'
}

export function mapObjectView(r: ObjectViewRow, catalog: ColumnMinWidths): ObjectView {
  return {
    id: r.id,
    ownerId: r.owner_id,
    name: r.name,
    description: r.description,
    filters: r.filters ?? {},
    advancedFilters: r.advanced_filters,
    columns: sanitizeViewColumns(r.columns, catalog),
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
