import type { TagEntityType } from '@repo/shared-types'

export interface TagRow {
  id: string
  name: string
  color: string
  entity_type: TagEntityType
  created_at: string
}
