import { request } from '@/shared/api/request'

import type {
  Contact,
  ContactInput,
  ContactListQuery,
  ContactTimeline,
  PaginatedContacts,
} from '@repo/shared-types'

const contactsService = {
  list: (params: ContactListQuery) =>
    request<PaginatedContacts>({ method: 'get', url: '/contacts', params }),

  getById: (id: string) => request<Contact>({ method: 'get', url: `/contacts/${id}` }),

  create: (data: ContactInput) => request<Contact>({ method: 'post', url: '/contacts', data }),

  update: (id: string, data: Partial<ContactInput>) =>
    request<Contact>({ method: 'patch', url: `/contacts/${id}`, data }),

  archive: (id: string) => request<void>({ method: 'delete', url: `/contacts/${id}` }),

  timeline: (id: string) =>
    request<ContactTimeline>({ method: 'get', url: `/contacts/${id}/timeline` }),
}

export default contactsService
