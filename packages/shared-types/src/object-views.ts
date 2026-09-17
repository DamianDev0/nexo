import type { CustomFieldEntity, CustomFieldType, SelectOption } from './settings'

export const OBJECT_TYPES = ['contact', 'company', 'deal'] as const

export type ObjectType = (typeof OBJECT_TYPES)[number]

export const OBJECT_CUSTOM_FIELD_ENTITY: Readonly<Record<ObjectType, CustomFieldEntity>> = {
  contact: 'contacts',
  company: 'companies',
  deal: 'deals',
}

export const OBJECT_VIEW_VISIBILITIES = ['private', 'shared'] as const

export type ObjectViewVisibility = (typeof OBJECT_VIEW_VISIBILITIES)[number]

export const OBJECT_VIEW_DENSITIES = ['compact', 'comfortable'] as const

export type ObjectViewDensity = (typeof OBJECT_VIEW_DENSITIES)[number]

export const OBJECT_VIEW_SORT_DIRECTIONS = ['asc', 'desc'] as const

export type ObjectViewSortDirection = (typeof OBJECT_VIEW_SORT_DIRECTIONS)[number]

export type ObjectViewSort = {
  field: string
  direction: ObjectViewSortDirection
}

export const OBJECT_COLUMN_MIN_WIDTH = 90

export const OBJECT_COLUMN_MAX_WIDTH = 480

export const OBJECT_CUSTOM_COLUMN_WIDTH = 150

export const OBJECT_CUSTOM_COLUMN_MIN_WIDTH = 100

export const OBJECT_TABLE_MAX_COLUMNS = 60

export const OBJECT_TABLE_MAX_PINNED = 10

export const CUSTOM_COLUMN_PREFIX = 'custom:'

export type ObjectViewColumns = {
  order?: string[]
  hidden?: string[]
  widths?: Record<string, number>
  pinnedLeft?: string[]
  pinnedRight?: string[]
}

export type ObjectView = {
  id: string
  ownerId: string
  name: string
  description: string | null
  filters: Record<string, unknown>
  advancedFilters: Record<string, unknown> | null
  columns: ObjectViewColumns
  sort: ObjectViewSort | null
  density: ObjectViewDensity
  isDefault: boolean
  isFavorite: boolean
  visibility: ObjectViewVisibility
  position: number
  createdAt: string
  updatedAt: string
}

export type ObjectViewInput = {
  name: string
  description?: string | null
  filters?: Record<string, unknown>
  advancedFilters?: Record<string, unknown> | null
  columns?: ObjectViewColumns
  sort?: ObjectViewSort | null
  density?: ObjectViewDensity
  isDefault?: boolean
  isFavorite?: boolean
  visibility?: ObjectViewVisibility
}

export type ObjectColumnDef<TSortField extends string = string> = {
  key: string
  labelKey: string
  hintKey: string
  sortField: TSortField | null
  defaultVisible: boolean
  defaultWidth: number
  minWidth: number
  custom?: boolean
  label?: string | null
  fieldType?: CustomFieldType
  fieldOptions?: SelectOption[]
}

export type ObjectTableState = {
  columns?: ObjectViewColumns
  density?: ObjectViewDensity
  listOrder?: string[]
}

export type ObjectWorkspaceBase<TSortField extends string = string> = {
  views: ObjectView[]
  activeViewId: string | null
  tableState: ObjectTableState
  columns: ObjectColumnDef<TSortField>[]
}
