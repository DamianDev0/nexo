export interface FilterRow {
  id: string
  user_id: string
  entity_type: string
  name: string
  filters: Record<string, unknown>
  is_default: boolean
  position: number
  created_at: string
  updated_at: string
}
