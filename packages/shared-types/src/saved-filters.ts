export type SavedFilterEntityType =
  | 'contact'
  | 'company'
  | 'deal'
  | 'activity'
  | 'product'
  | 'invoice'

export type SavedFilter = {
  id: string
  userId: string
  entityType: SavedFilterEntityType
  name: string
  filters: Record<string, unknown>
  isDefault: boolean
  position: number
  createdAt: string
  updatedAt: string
}
