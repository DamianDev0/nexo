import type { ObjectType, ObjectViewSort } from '@repo/shared-types'

export interface ObjectViewRow {
  id: string
  owner_id: string
  name: string
  description: string | null
  filters: Record<string, unknown>
  advanced_filters: Record<string, unknown> | null
  columns: Record<string, unknown>
  sort: ObjectViewSort | null
  density: string
  is_default: boolean
  is_favorite: boolean
  visibility: string
  position: number
  created_at: string
  updated_at: string
}

export interface ObjectViewCopyData {
  objectType: ObjectType
  ownerId: string
  name: string
  description: string | null
  filters: Record<string, unknown>
  advancedFilters: Record<string, unknown> | null
  columns: object
  sort: ObjectViewSort | null
  density: string
  position: number
}

export interface ObjectViewInsertData extends ObjectViewCopyData {
  isDefault: boolean
  isFavorite: boolean
  visibility: string
}

export interface ObjectViewUpdateData {
  name: string
  description: string | null
  filters: Record<string, unknown>
  advancedFilters: Record<string, unknown> | null
  columns: object
  sort: ObjectViewSort | null
  density: string
  isDefault: boolean
  isFavorite: boolean
  visibility: string
}

export interface ObjectWorkspaceStateRow {
  active_view_id: string | null
  table_state: Record<string, unknown>
}
