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
