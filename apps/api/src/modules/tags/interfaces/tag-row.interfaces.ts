import type { TagEntityType } from '@repo/shared-types'

export interface TagRow {
  id: string
  name: string
  color: string
  description: string | null
  enabled: boolean
  entity_type: TagEntityType
  deleted_at: string | null
  created_at: string
}

export interface DeletedTagRow {
  name: string
  deleted_from_contact_ids: string[]
}
