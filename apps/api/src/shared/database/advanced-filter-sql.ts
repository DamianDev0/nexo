import {
  FILTER_OPERATORS_BY_TYPE,
  VALUELESS_OPERATORS,
  type FilterCondition,
  type FilterFieldType,
} from '@repo/shared-types'

export type FilterableColumn = {
  column: string
  type: FilterFieldType
}

const CUSTOM_FIELD_PREFIX = 'custom.'
const CUSTOM_KEY_PATTERN = /^[a-z][a-z0-9_]{0,63}$/

function bind(params: unknown[], value: unknown): string {
  params.push(value)
  return `$${params.length}`
}

function textClause(
  expr: string,
  condition: FilterCondition,
  params: unknown[],
): string | null {
  const value = String(condition.value ?? '')
  switch (condition.operator) {
    case 'contains':
      return `${expr} ILIKE ${bind(params, `%${value}%`)}`
    case 'not_contains':
      return `(${expr} IS NULL OR ${expr} NOT ILIKE ${bind(params, `%${value}%`)})`
    case 'is':
      return `LOWER(${expr}) = LOWER(${bind(params, value)})`
    case 'is_not':
      return `(${expr} IS NULL OR LOWER(${expr}) <> LOWER(${bind(params, value)}))`
    case 'is_any_of':
      return `${expr} = ANY(${bind(params, condition.value)}::text[])`
    case 'is_empty':
      return `(${expr} IS NULL OR ${expr} = '')`
    case 'is_not_empty':
      return `(${expr} IS NOT NULL AND ${expr} <> '')`
    default:
      return null
  }
}

function multiClause(column: string, condition: FilterCondition, params: unknown[]): string | null {
  switch (condition.operator) {
    case 'is_any_of':
      return `${column} && ${bind(params, condition.value)}::text[]`
    case 'is':
      return `${column} @> ${bind(params, condition.value)}::text[]`
    case 'is_empty':
      return `(${column} IS NULL OR ${column} = '{}')`
    case 'is_not_empty':
      return `(${column} IS NOT NULL AND ${column} <> '{}')`
    default:
      return null
  }
}

function comparableClause(
  column: string,
  condition: FilterCondition,
  params: unknown[],
): string | null {
  switch (condition.operator) {
    case 'is':
      return `${column} = ${bind(params, condition.value)}`
    case 'gte':
      return `${column} >= ${bind(params, condition.value)}`
    case 'lte':
      return `${column} <= ${bind(params, condition.value)}`
    case 'is_empty':
      return `${column} IS NULL`
    case 'is_not_empty':
      return `${column} IS NOT NULL`
    default:
      return null
  }
}

function dateClause(column: string, condition: FilterCondition, params: unknown[]): string | null {
  switch (condition.operator) {
    case 'gte':
      return `${column} >= ${bind(params, condition.value)}::date`
    case 'lte':
      return `${column} < (${bind(params, condition.value)}::date + 1)`
    case 'is_empty':
      return `${column} IS NULL`
    case 'is_not_empty':
      return `${column} IS NOT NULL`
    default:
      return null
  }
}

function conditionClause(
  condition: FilterCondition,
  columns: Readonly<Record<string, FilterableColumn>>,
  params: unknown[],
): string | null {
  if (condition.field.startsWith(CUSTOM_FIELD_PREFIX)) {
    const key = condition.field.slice(CUSTOM_FIELD_PREFIX.length)
    if (!CUSTOM_KEY_PATTERN.test(key)) return null
    return textClause(`custom_fields->>${bind(params, key)}`, condition, params)
  }

  const target = columns[condition.field]
  if (!target) return null
  if (!FILTER_OPERATORS_BY_TYPE[target.type].includes(condition.operator)) return null

  switch (target.type) {
    case 'multi':
      return multiClause(target.column, condition, params)
    case 'number':
      return comparableClause(target.column, condition, params)
    case 'date':
      return dateClause(target.column, condition, params)
    default:
      return textClause(target.column, condition, params)
  }
}

export function advancedFilterClauses(
  conditions: ReadonlyArray<FilterCondition>,
  columns: Readonly<Record<string, FilterableColumn>>,
  params: unknown[],
): string[] {
  const clauses: string[] = []
  for (const condition of conditions) {
    if (!VALUELESS_OPERATORS.includes(condition.operator) && condition.value === undefined) continue
    const clause = conditionClause(condition, columns, params)
    if (clause) clauses.push(clause)
  }
  return clauses
}
