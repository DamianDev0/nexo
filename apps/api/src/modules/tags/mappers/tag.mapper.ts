import type { Tag } from '@repo/shared-types'
import type { TagRow } from '../interfaces/tag-row.interfaces'

export function mapTagRow(r: TagRow): Tag {
  return {
    id: r.id,
    name: r.name,
    color: r.color,
    description: r.description ?? null,
    enabled: r.enabled ?? true,
    entityType: r.entity_type,
    createdAt: r.created_at,
  }
}
