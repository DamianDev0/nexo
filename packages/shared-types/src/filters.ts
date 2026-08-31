export const FILTER_FIELD_TYPES = ['text', 'select', 'multi', 'number', 'date'] as const
export type FilterFieldType = (typeof FILTER_FIELD_TYPES)[number]

export const FILTER_OPERATORS = [
  'is',
  'is_not',
  'contains',
  'not_contains',
  'is_any_of',
  'is_empty',
  'is_not_empty',
  'gte',
  'lte',
] as const
export type FilterOperator = (typeof FILTER_OPERATORS)[number]

export type FilterValue = string | number | ReadonlyArray<string>

export type FilterCondition = {
  field: string
  operator: FilterOperator
  value?: FilterValue
}

export const FILTER_OPERATORS_BY_TYPE: Readonly<
  Record<FilterFieldType, ReadonlyArray<FilterOperator>>
> = {
  text: ['contains', 'not_contains', 'is', 'is_not', 'is_empty', 'is_not_empty'],
  select: ['is', 'is_not', 'is_any_of', 'is_empty', 'is_not_empty'],
  multi: ['is_any_of', 'is', 'is_empty', 'is_not_empty'],
  number: ['is', 'gte', 'lte', 'is_empty', 'is_not_empty'],
  date: ['gte', 'lte', 'is_empty', 'is_not_empty'],
}

export const VALUELESS_OPERATORS: ReadonlyArray<FilterOperator> = ['is_empty', 'is_not_empty']

export const FILTER_MAX_CONDITIONS = 12
export const FILTER_MAX_VALUES = 50
