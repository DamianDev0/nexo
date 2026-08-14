import { request } from '@/shared/api/request'

import type { PaginatedTags, Tag, TagEntityType } from '@repo/shared-types'

const tagsService = {
  list: (params: { entityType?: TagEntityType; page?: number; limit?: number } = {}) =>
    request<PaginatedTags>({ method: 'get', url: '/tags', params }),

  create: (data: {
    name: string
    color?: string
    description?: string
    entityType: TagEntityType
  }) => request<Tag>({ method: 'post', url: '/tags', data }),

  update: (
    id: string,
    data: { name?: string; color?: string; description?: string; enabled?: boolean },
  ) => request<Tag>({ method: 'patch', url: `/tags/${id}`, data }),

  remove: (id: string) => request<void>({ method: 'delete', url: `/tags/${id}` }),
}

export default tagsService
