export const CONTACT_VIEW_VISIBILITIES = ['private', 'shared'] as const

export type ContactViewVisibility = (typeof CONTACT_VIEW_VISIBILITIES)[number]

export const CONTACT_VIEW_DENSITIES = ['compact', 'comfortable', 'spacious'] as const

export type ContactViewDensity = (typeof CONTACT_VIEW_DENSITIES)[number]

export const CONTACT_VIEW_SORT_DIRECTIONS = ['asc', 'desc'] as const

export type ContactViewSortDirection = (typeof CONTACT_VIEW_SORT_DIRECTIONS)[number]

export type ContactViewSort = {
  field: string
  direction: ContactViewSortDirection
}

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

export type ContactViewInput = {
  name: string
  filters?: Record<string, unknown>
  advancedFilters?: Record<string, unknown> | null
  columns?: ContactViewColumns
  sort?: ContactViewSort | null
  density?: ContactViewDensity
  isDefault?: boolean
  isFavorite?: boolean
  visibility?: ContactViewVisibility
}

export type ContactCounts = {
  total: number
  byStatus: Record<string, number>
}

export type ContactColumnType = 'name' | 'text' | 'badge' | 'tags' | 'number' | 'date' | 'user'

export type ContactColumnDef = {
  key: string
  labelKey: string
  type: ContactColumnType
  sortable: boolean
  editable: boolean
  defaultVisible: boolean
  defaultWidth: number
  minWidth: number
}

export type ContactQuickFilterOptions = {
  statuses: string[]
  sources: string[]
  lifecycleStages: string[]
}

export type ContactTableState = Record<string, unknown>

export type ContactWorkspace = {
  views: ContactView[]
  activeViewId: string | null
  tableState: ContactTableState
  columns: ContactColumnDef[]
  quickFilters: ContactQuickFilterOptions
  counts: ContactCounts
}

export type ContactWorkspaceStateInput = {
  activeViewId?: string | null
  tableState?: ContactTableState
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
}
