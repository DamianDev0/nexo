import type { FilterCondition } from '@repo/shared-types'
import { advancedFilterClauses, type FilterableColumn } from './advanced-filter-sql'
import { searchClause, type SearchSource } from './search-sql'

export type RecordFilterQuery = {
  q?: string
  archived?: boolean
  advanced?: FilterCondition[]
}

export type RecordFilterDefinition<TQuery extends RecordFilterQuery> = {
  activeCondition: string
  archivedCondition: string
  search: SearchSource
  valueFilters: ReadonlyArray<readonly [keyof TQuery, string]>
  flagFilters?: ReadonlyArray<readonly [keyof TQuery, string]>
  filterableColumns: Readonly<Record<string, FilterableColumn>>
}

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true
  return Array.isArray(value) && value.length === 0
}

export function buildRecordWhereClause<TQuery extends RecordFilterQuery>(
  definition: RecordFilterDefinition<TQuery>,
  query: TQuery,
): { where: string; params: unknown[] } {
  const conditions: string[] = []
  const params: unknown[] = []

  conditions.push(
    query.archived === true ? definition.archivedCondition : definition.activeCondition,
  )

  if (query.q) conditions.push(searchClause(query.q, definition.search, params))

  for (const [key, clause] of definition.flagFilters ?? []) {
    if (query[key] === true) conditions.push(clause)
  }

  for (const [key, clause] of definition.valueFilters) {
    const value = query[key]
    if (isEmpty(value)) continue
    params.push(value)
    conditions.push(clause.replace('?', `$${params.length}`))
  }

  if (query.advanced?.length) {
    conditions.push(...advancedFilterClauses(query.advanced, definition.filterableColumns, params))
  }

  return { where: conditions.join(' AND '), params }
}
