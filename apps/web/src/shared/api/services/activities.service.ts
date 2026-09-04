import { request } from '@/shared/api/request'

export type CreateActivityInput = {
  readonly activityType: string
  readonly title?: string
  readonly description?: string
  readonly contactId?: string
  readonly companyId?: string
  readonly dealId?: string
}

const activitiesService = {
  create: (data: CreateActivityInput) =>
    request<{ id: string }>({ method: 'post', url: '/activities', data }),
}

export default activitiesService
