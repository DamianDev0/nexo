export interface ContactViewRow {
  id: string
  owner_id: string
  name: string
  filters: Record<string, unknown>
  advanced_filters: Record<string, unknown> | null
  columns: Record<string, unknown>
  sort: { field: string; direction: 'asc' | 'desc' } | null
  density: string
  is_default: boolean
  is_favorite: boolean
  visibility: string
  position: number
  created_at: string
  updated_at: string
}

export interface ContactViewCopyData {
  ownerId: string
  name: string
  filters: Record<string, unknown>
  advancedFilters: Record<string, unknown> | null
  columns: object
  sort: { field: string; direction: 'asc' | 'desc' } | null
  density: string
  position: number
}

export interface ContactViewInsertData extends ContactViewCopyData {
  isDefault: boolean
  isFavorite: boolean
  visibility: string
}

export interface ContactViewUpdateData {
  name: string
  filters: Record<string, unknown>
  advancedFilters: Record<string, unknown> | null
  columns: object
  sort: { field: string; direction: 'asc' | 'desc' } | null
  density: string
  isDefault: boolean
  isFavorite: boolean
  visibility: string
}
