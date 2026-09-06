export type TagEntityType = 'contact' | 'company' | 'deal' | 'product'

export type Tag = {
  id: string
  name: string
  color: string
  description: string | null
  enabled: boolean
  entityType: TagEntityType
  deletedAt: string | null
  createdAt: string
}

export type PaginatedTags = {
  data: Tag[]
  total: number
  page: number
  limit: number
}
