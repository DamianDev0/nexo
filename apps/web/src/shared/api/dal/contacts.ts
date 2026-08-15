import 'server-only'

import { CACHE_TAGS } from '../cache-tags'
import { apiFetch } from '../client'

import type {
  ContactCounts,
  ContactListQuery,
  ContactTaxonomyUsage,
  ContactWorkspace,
  PaginatedContacts,
} from '@repo/shared-types'

function appendParam(params: URLSearchParams, key: string, value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) appendParam(params, key, item)
    return
  }
  if (typeof value === 'string') {
    if (value.length > 0) params.append(key, value)
    return
  }
  if (typeof value === 'number' && Number.isFinite(value)) params.append(key, value.toString())
  if (typeof value === 'boolean') params.append(key, value.toString())
}

function toSearchParams(query: ContactListQuery): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) appendParam(params, key, value)

  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export const listContacts = (query: ContactListQuery) =>
  apiFetch<PaginatedContacts>(`/contacts${toSearchParams(query)}`, {
    tags: [CACHE_TAGS.contacts],
  })

export const getContactCounts = () =>
  apiFetch<ContactCounts>('/contacts/counts', { tags: [CACHE_TAGS.contacts] })

export const getContactWorkspace = () =>
  apiFetch<ContactWorkspace>('/contacts/workspace', { cache: 'no-store' })

export const getContactTaxonomyUsage = () =>
  apiFetch<ContactTaxonomyUsage>('/contacts/taxonomy-usage', { tags: [CACHE_TAGS.contacts] })
