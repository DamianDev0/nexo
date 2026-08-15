import { CONTACT_SORT_FIELDS } from '@repo/shared-types'

import type { DataTableSort } from '@/shared/ui/organisms/data-table'
import type { ContactColumnDef, ContactSortField } from '@repo/shared-types'

export type ContactSort = {
  readonly field: ContactSortField
  readonly direction: 'asc' | 'desc'
}

export function parseSortParam(value: string | null): ContactSort | null {
  if (!value) return null

  const descending = value.startsWith('-')
  const field = descending ? value.slice(1) : value

  return CONTACT_SORT_FIELDS.some((candidate) => candidate === field)
    ? { field: field as ContactSortField, direction: descending ? 'desc' : 'asc' }
    : null
}

export function serializeSort(sort: ContactSort | null): string | null {
  if (!sort) return null
  return sort.direction === 'desc' ? `-${sort.field}` : sort.field
}

export function toColumnSort(
  sort: ContactSort | null,
  catalog: ReadonlyArray<ContactColumnDef>,
): DataTableSort | null {
  if (!sort) return null

  const column = catalog.find((def) => def.sortField === sort.field)
  return column ? { field: column.key, direction: sort.direction } : null
}

export function fromColumnSort(
  sort: DataTableSort | null,
  catalog: ReadonlyArray<ContactColumnDef>,
): ContactSort | null {
  if (!sort) return null

  const column = catalog.find((def) => def.key === sort.field)
  return column?.sortField ? { field: column.sortField, direction: sort.direction } : null
}
