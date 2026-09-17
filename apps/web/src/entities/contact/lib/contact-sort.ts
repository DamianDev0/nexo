import { CONTACT_SORT_FIELDS } from '@repo/shared-types'

import type { RecordSort } from '@/entities/object-descriptor'
import type { ContactSortField, ObjectViewSort } from '@repo/shared-types'

export type ContactSort = RecordSort<ContactSortField>

export function parseSortParam(value: string | null): ContactSort | null {
  if (!value) return null

  const descending = value.startsWith('-')
  const field = descending ? value.slice(1) : value

  return CONTACT_SORT_FIELDS.some((candidate) => candidate === field)
    ? { field: field as ContactSortField, direction: descending ? 'desc' : 'asc' }
    : null
}

export function contactSortFrom(sort: ObjectViewSort | null): ContactSort | null {
  if (!sort) return null
  return parseSortParam(sort.direction === 'desc' ? `-${sort.field}` : sort.field)
}

export function serializeSort(sort: ContactSort | null): string | null {
  if (!sort) return null
  return sort.direction === 'desc' ? `-${sort.field}` : sort.field
}
