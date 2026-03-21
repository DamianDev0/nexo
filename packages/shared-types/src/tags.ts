export type TagEntityType = 'contact' | 'company' | 'deal' | 'product'

export type Tag = {
  id: string
  name: string
  color: string
  entityType: TagEntityType
  createdAt: string
}
