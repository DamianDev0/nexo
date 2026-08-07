import { request } from '@/shared/api/request'

import type { Tag, TagEntityType } from '@repo/shared-types'

const tagsService = {
  list: (entityType?: TagEntityType) =>
    request<Tag[]>({ method: 'get', url: '/tags', params: entityType ? { entityType } : {} }),

  create: (data: { name: string; color?: string; entityType: TagEntityType }) =>
    request<Tag>({ method: 'post', url: '/tags', data }),

  update: (id: string, data: { name?: string; color?: string }) =>
    request<Tag>({ method: 'patch', url: `/tags/${id}`, data }),

  remove: (id: string) => request<void>({ method: 'delete', url: `/tags/${id}` }),
}

export default tagsService
