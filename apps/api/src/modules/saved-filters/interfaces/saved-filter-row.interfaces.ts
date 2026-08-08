import type { SavedFilterEntityType } from '@repo/shared-types'

export interface FilterRow {
  id: string
  user_id: string
  entity_type: SavedFilterEntityType
  name: string
  filters: Record<string, unknown>
  is_default: boolean
  position: number
  created_at: string
  updated_at: string
}

export type CreateSavedFilterData = {
  entityType: SavedFilterEntityType
  name: string
  filters: Record<string, unknown>
  isDefault?: boolean
}

export type UpdateSavedFilterData = Partial<{
  name: string
  filters: Record<string, unknown>
  isDefault: boolean
}>
