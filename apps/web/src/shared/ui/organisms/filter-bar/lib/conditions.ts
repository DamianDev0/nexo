import {
  FILTER_MAX_CONDITIONS,
  FILTER_OPERATORS,
  FILTER_OPERATORS_BY_TYPE,
  VALUELESS_OPERATORS,
  type FilterCondition,
  type FilterFieldType,
  type FilterOperator,
} from '@repo/shared-types'

export function defaultOperator(type: FilterFieldType): FilterOperator {
  return FILTER_OPERATORS_BY_TYPE[type][0] ?? 'is'
}

export function operatorsFor(type: FilterFieldType): ReadonlyArray<FilterOperator> {
  return FILTER_OPERATORS_BY_TYPE[type]
}

export function needsValue(operator: FilterOperator): boolean {
  return !VALUELESS_OPERATORS.includes(operator)
}

export function isComplete(condition: FilterCondition): boolean {
  if (!needsValue(condition.operator)) return true
  if (Array.isArray(condition.value)) return condition.value.length > 0
  return condition.value !== undefined && condition.value !== ''
}

export function serializeConditions(conditions: ReadonlyArray<FilterCondition>): string | null {
  const complete = conditions.filter(isComplete)
  return complete.length > 0 ? JSON.stringify(complete) : null
}

export function parseConditions(raw: string | null | undefined): FilterCondition[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((entry): entry is FilterCondition => {
        if (typeof entry !== 'object' || entry === null) return false
        const { field, operator } = entry as Partial<FilterCondition>
        return (
          typeof field === 'string' && FILTER_OPERATORS.includes(operator as FilterOperator)
        )
      })
      .slice(0, FILTER_MAX_CONDITIONS)
  } catch {
    return []
  }
}
