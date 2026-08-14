export type TagEntityType = 'contact' | 'company' | 'deal' | 'product'

export type Tag = {
  id: string
  name: string
  color: string
  description: string | null
  enabled: boolean
  entityType: TagEntityType
  createdAt: string
}

export type PaginatedTags = {
  data: Tag[]
  total: number
  page: number
  limit: number
}
