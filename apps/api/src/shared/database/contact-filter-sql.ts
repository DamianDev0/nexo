import type { ContactListQuery } from '@repo/shared-types'
import { advancedFilterClauses, type FilterableColumn } from './advanced-filter-sql'
import { searchClause, type SearchSource } from './search-sql'

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

export function buildContactWhereClause(query: ContactFilterQuery): {
  where: string
  params: unknown[]
} {
  const conditions: string[] = []
  const params: unknown[] = []

  const push = (condition: string, value: unknown) => {
    params.push(value)
    conditions.push(condition.replace('?', `$${params.length}`))
  }

  conditions.push(query.archived === true ? 'is_active = false' : 'is_active = true')

  if (query.q) conditions.push(searchClause(query.q, CONTACT_SEARCH, params))
  if (query.unassigned === true) conditions.push('assigned_to_id IS NULL')

  for (const [key, clause] of CONTACT_LIST_FILTERS) {
    const value = query[key]
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value) && value.length === 0) continue
    push(clause, value)
  }

  if (query.advanced?.length) {
    conditions.push(...advancedFilterClauses(query.advanced, CONTACT_FILTERABLE_COLUMNS, params))
  }

  return { where: conditions.join(' AND '), params }
}
