import type { TimelineEntry } from '@repo/shared-types'
import type { TimelineRow } from '../interfaces/timeline-row.interfaces'

export function mapTimelineRow(r: TimelineRow): TimelineEntry {
  return {
    id: r.id,
    eventType: r.event_type,
    title: r.title,
    description: r.description,
    entityType: r.entity_type,
    entityId: r.entity_id,
    userId: r.user_id,
    userName: r.user_name,
    metadata: r.metadata ?? {},
    createdAt: r.created_at,
  }
}
