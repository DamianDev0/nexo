import { BadRequestException } from '@nestjs/common'
import {
  FILTER_MAX_CONDITIONS,
  FILTER_MAX_VALUES,
  FILTER_OPERATORS,
  VALUELESS_OPERATORS,
  type FilterCondition,
  type FilterOperator,
} from '@repo/shared-types'

const FIELD_PATTERN = /^[a-zA-Z][a-zA-Z0-9_.]{0,80}$/
const MAX_VALUE_LENGTH = 200

function isValidValue(operator: FilterOperator, value: unknown): boolean {
  if (VALUELESS_OPERATORS.includes(operator)) return true
  if (operator === 'is_any_of') {
    return (
      Array.isArray(value) &&
      value.length > 0 &&
      value.length <= FILTER_MAX_VALUES &&
      value.every((item) => typeof item === 'string' && item.length <= MAX_VALUE_LENGTH)
    )
  }
  if (typeof value === 'number') return Number.isFinite(value)
  if (operator === 'is' && Array.isArray(value)) {
    return value.every((item) => typeof item === 'string' && item.length <= MAX_VALUE_LENGTH)
  }
  return typeof value === 'string' && value.length <= MAX_VALUE_LENGTH
}

export function parseAdvancedFilters(raw: string | undefined): FilterCondition[] | undefined {
  if (!raw) return undefined

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new BadRequestException('advanced must be valid JSON')
  }

  if (!Array.isArray(parsed)) throw new BadRequestException('advanced must be an array')
  if (parsed.length > FILTER_MAX_CONDITIONS) {
    throw new BadRequestException(`advanced accepts at most ${FILTER_MAX_CONDITIONS} conditions`)
  }

  return parsed.map((entry) => {
    const { field, operator, value } = (entry ?? {}) as Partial<FilterCondition>
    if (typeof field !== 'string' || !FIELD_PATTERN.test(field)) {
      throw new BadRequestException(`Invalid filter field: ${String(field)}`)
    }
    if (!FILTER_OPERATORS.includes(operator as FilterOperator)) {
      throw new BadRequestException(`Invalid filter operator: ${String(operator)}`)
    }
    if (!isValidValue(operator as FilterOperator, value)) {
      throw new BadRequestException(`Invalid filter value for "${field}"`)
    }
    return { field, operator: operator as FilterOperator, value }
  })
}
