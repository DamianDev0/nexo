export interface TimelineRow {
  id: string
  event_type: string
  title: string
  description: string | null
  entity_type: string | null
  entity_id: string | null
  user_id: string | null
  user_name: string | null
  metadata: Record<string, unknown>
  created_at: string
}
