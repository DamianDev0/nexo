import { request } from '@/shared/api/request'

import type {
  Contact,
  ContactCounts,
  ContactDuplicateProbeQuery,
  ContactDuplicateProbeResult,
  ContactInput,
  ContactListQuery,
  ContactTaxonomyUsage,
  ContactTimeline,
  PaginatedContacts,
  TaxonomyReassignKind,
} from '@repo/shared-types'

const contactsService = {
  list: (params: ContactListQuery) =>
    request<PaginatedContacts>({ method: 'get', url: '/contacts', params }),

  counts: () => request<ContactCounts>({ method: 'get', url: '/contacts/counts' }),

  taxonomyUsage: () =>
    request<ContactTaxonomyUsage>({ method: 'get', url: '/contacts/taxonomy-usage' }),

  reassignTaxonomy: (data: { kind: TaxonomyReassignKind; fromKey: string; toKey: string }) =>
    request<{ reassigned: number }>({ method: 'patch', url: '/contacts/reassign-taxonomy', data }),

  probeDuplicates: (params: ContactDuplicateProbeQuery) =>
    request<ContactDuplicateProbeResult>({
      method: 'get',
      url: '/contacts/duplicates/probe',
      params,
    }),

  getById: (id: string) => request<Contact>({ method: 'get', url: `/contacts/${id}` }),

  create: (data: ContactInput, force?: boolean) =>
    request<Contact>({
      method: 'post',
      url: '/contacts',
      data,
      params: force ? { force } : undefined,
    }),

  update: (id: string, data: Partial<ContactInput>, force?: boolean) =>
    request<Contact>({
      method: 'patch',
      url: `/contacts/${id}`,
      data,
      params: force ? { force } : undefined,
    }),

  archive: (id: string) => request<void>({ method: 'delete', url: `/contacts/${id}` }),

  timeline: (id: string) =>
    request<ContactTimeline>({ method: 'get', url: `/contacts/${id}/timeline` }),
}

export default contactsService
