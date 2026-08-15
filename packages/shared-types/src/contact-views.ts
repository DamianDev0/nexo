import type { ContactSortField } from './contacts'

export const CONTACT_VIEW_VISIBILITIES = ['private', 'shared'] as const

export type ContactViewVisibility = (typeof CONTACT_VIEW_VISIBILITIES)[number]

export const CONTACT_VIEW_DENSITIES = ['compact', 'comfortable'] as const

export type ContactViewDensity = (typeof CONTACT_VIEW_DENSITIES)[number]

export const CONTACT_VIEW_SORT_DIRECTIONS = ['asc', 'desc'] as const

export type ContactViewSortDirection = (typeof CONTACT_VIEW_SORT_DIRECTIONS)[number]

export type ContactViewSort = {
  field: string
  direction: ContactViewSortDirection
}

export const CONTACT_COLUMN_MIN_WIDTH = 90

export const CONTACT_COLUMN_MAX_WIDTH = 480

export const CONTACT_TABLE_MAX_COLUMNS = 60

export const CONTACT_TABLE_MAX_PINNED = 10

export type ContactViewColumns = {
  order?: string[]
  hidden?: string[]
  widths?: Record<string, number>
  pinnedLeft?: string[]
  pinnedRight?: string[]
}

export type ContactView = {
  id: string
  ownerId: string
  name: string
  filters: Record<string, unknown>
  advancedFilters: Record<string, unknown> | null
  columns: ContactViewColumns
  sort: ContactViewSort | null
  density: ContactViewDensity
  isDefault: boolean
  isFavorite: boolean
  visibility: ContactViewVisibility
  position: number
  createdAt: string
  updatedAt: string
}

export type ContactCounts = {
  total: number
  byStatus: Record<string, number>
}

export type ContactTaxonomyUsage = {
  statuses: Record<string, number>
  sources: Record<string, number>
  types: Record<string, number>
  tags: Record<string, number>
}

export type TaxonomyReassignKind = 'status' | 'source' | 'type' | 'tag'

export type ContactColumnDef = {
  key: string
  labelKey: string
  hintKey: string
  sortField: ContactSortField | null
  defaultVisible: boolean
  defaultWidth: number
  minWidth: number
}

export type ContactQuickFilterOptions = {
  statuses: string[]
  sources: string[]
  lifecycleStages: string[]
}

export type ContactTableState = {
  columns?: ContactViewColumns
  density?: ContactViewDensity
  listOrder?: string[]
}

export type ContactWorkspace = {
  views: ContactView[]
  activeViewId: string | null
  tableState: ContactTableState
  columns: ContactColumnDef[]
  quickFilters: ContactQuickFilterOptions
  counts: ContactCounts
}

export type ContactDuplicateSeverity = 'hard' | 'soft'

export type ContactDuplicateMatch = {
  id: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  documentNumber: string | null
  field: 'email' | 'documentNumber' | 'phone' | 'name'
}

export type ContactDuplicatePayload = {
  severity: ContactDuplicateSeverity
  field: ContactDuplicateMatch['field']
  matches: ContactDuplicateMatch[]
  canForce: boolean
}

export type ContactDuplicateProbeQuery = {
  email?: string
  phone?: string
  whatsapp?: string
  firstName?: string
  lastName?: string
  documentNumber?: string
  excludeId?: string
}

export type ContactDuplicateProbeResult = {
  duplicate: ContactDuplicatePayload | null
}
