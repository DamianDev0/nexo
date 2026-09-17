import type { ContactListQuery } from '@repo/shared-types'
import type { FilterableColumn } from './advanced-filter-sql'
import { buildRecordWhereClause, type RecordFilterDefinition } from './record-filter-sql'
import type { SearchSource } from './search-sql'

export type ContactFilterQuery = Omit<ContactListQuery, 'sortBy' | 'sortDir' | 'page' | 'limit'>

export const CONTACT_FILTERABLE_COLUMNS: Readonly<Record<string, FilterableColumn>> = {
  name: { column: "(first_name || ' ' || COALESCE(last_name, ''))", type: 'text' },
  firstName: { column: 'first_name', type: 'text' },
  lastName: { column: 'last_name', type: 'text' },
  email: { column: 'email', type: 'text' },
  phone: { column: 'phone', type: 'text' },
  whatsapp: { column: 'whatsapp', type: 'text' },
  city: { column: 'city', type: 'text' },
  documentNumber: { column: 'document_number', type: 'text' },
  status: { column: 'status', type: 'select' },
  source: { column: 'source', type: 'select' },
  lifecycleStage: { column: 'lifecycle_stage', type: 'select' },
  assignedToId: { column: 'assigned_to_id', type: 'select' },
  companyId: { column: 'company_id', type: 'select' },
  tags: { column: 'tags', type: 'multi' },
  createdAt: { column: 'created_at', type: 'date' },
  updatedAt: { column: 'updated_at', type: 'date' },
  lastContactedAt: { column: 'last_contacted_at', type: 'date' },
}

export const CONTACT_SEARCH: SearchSource = {
  columns: ['first_name', 'last_name', 'email', 'document_number', 'phone'],
  customFieldsColumn: 'custom_fields',
  indexed: { vector: 'search_vector', text: 'search_text' },
}

export const CONTACT_LIST_FILTERS: ReadonlyArray<readonly [keyof ContactFilterQuery, string]> = [
  ['status', 'status = ?'],
  ['source', 'source = ?'],
  ['lifecycleStage', 'lifecycle_stage = ?'],
  ['tags', 'tags @> ?::text[]'],
  ['companyId', 'company_id = ?'],
  ['assignedToId', 'assigned_to_id = ?'],
  ['city', 'LOWER(city) = LOWER(?)'],
  ['createdFrom', 'created_at >= ?'],
  ['createdTo', 'created_at <= ?'],
  ['lastContactedFrom', 'last_contacted_at >= ?'],
  ['lastContactedTo', 'last_contacted_at <= ?'],
]

export const CONTACT_FILTER_DEFINITION: RecordFilterDefinition<ContactFilterQuery> = {
  activeCondition: 'is_active = true',
  archivedCondition: 'is_active = false AND merged_into_id IS NULL',
  search: CONTACT_SEARCH,
  valueFilters: CONTACT_LIST_FILTERS,
  flagFilters: [['unassigned', 'assigned_to_id IS NULL']],
  filterableColumns: CONTACT_FILTERABLE_COLUMNS,
}

export function buildContactWhereClause(query: ContactFilterQuery): {
  where: string
  params: unknown[]
} {
  return buildRecordWhereClause(CONTACT_FILTER_DEFINITION, query)
}
