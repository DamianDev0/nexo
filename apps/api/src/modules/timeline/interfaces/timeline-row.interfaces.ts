import type { TimelineEventType } from '@repo/shared-types'

export interface TimelineRow {
  id: string
  event_type: TimelineEventType
  title: string
  description: string | null
  entity_type: string | null
  entity_id: string | null
  user_id: string | null
  user_name: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface TimelinePageResult {
  rows: TimelineRow[]
  total: number
}
