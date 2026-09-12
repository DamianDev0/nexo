import { request } from '@/shared/api/request'

import type { ActivityPriority } from '@repo/shared-types'

export type CreateActivityInput = {
  readonly activityType: string
  readonly title?: string
  readonly description?: string
  readonly dueDate?: string
  readonly durationMinutes?: number
  readonly reminderAt?: string
  readonly priority?: ActivityPriority
  readonly contactId?: string
  readonly companyId?: string
  readonly dealId?: string
  readonly assignedToId?: string
}

const activitiesService = {
  create: (data: CreateActivityInput) =>
    request<{ id: string }>({ method: 'post', url: '/activities', data }),

  complete: (id: string) =>
    request<{ id: string }>({ method: 'patch', url: `/activities/${id}/complete` }),

  reopen: (id: string) =>
    request<{ id: string }>({ method: 'patch', url: `/activities/${id}/reopen` }),

  cancel: (id: string) =>
    request<{ id: string }>({ method: 'patch', url: `/activities/${id}/cancel` }),

  update: (id: string, data: Partial<CreateActivityInput>) =>
    request<{ id: string }>({ method: 'patch', url: `/activities/${id}`, data }),

  remove: (id: string) => request<void>({ method: 'delete', url: `/activities/${id}` }),
}

export default activitiesService
