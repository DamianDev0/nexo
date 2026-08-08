import type { Tag } from '@repo/shared-types'
import type { TagRow } from '../interfaces/tag-row.interfaces'

export function mapTagRow(r: TagRow): Tag {
  return {
    id: r.id,
    name: r.name,
    color: r.color,
    entityType: r.entity_type,
    createdAt: r.created_at,
  }
}
