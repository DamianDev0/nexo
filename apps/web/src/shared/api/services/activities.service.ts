import { request } from '@/shared/api/request'

import type { ActivityPriority } from '@repo/shared-types'

export type CreateActivityInput = {
  readonly activityType: string
  readonly title?: string
  readonly description?: string
  readonly dueDate?: string
  readonly priority?: ActivityPriority
  readonly contactId?: string
  readonly companyId?: string
  readonly dealId?: string
}

const activitiesService = {
  create: (data: CreateActivityInput) =>
    request<{ id: string }>({ method: 'post', url: '/activities', data }),

  complete: (id: string) =>
    request<{ id: string }>({ method: 'patch', url: `/activities/${id}/complete` }),

  reopen: (id: string) =>
    request<{ id: string }>({ method: 'patch', url: `/activities/${id}/reopen` }),
}

export default activitiesService
