import type { ContactSortField } from './contacts'
import {
  OBJECT_COLUMN_MAX_WIDTH,
  OBJECT_COLUMN_MIN_WIDTH,
  OBJECT_TABLE_MAX_COLUMNS,
  OBJECT_TABLE_MAX_PINNED,
  OBJECT_VIEW_DENSITIES,
  OBJECT_VIEW_SORT_DIRECTIONS,
  OBJECT_VIEW_VISIBILITIES,
} from './object-views'
import type {
  ObjectColumnDef,
  ObjectTableState,
  ObjectView,
  ObjectViewColumns,
  ObjectViewDensity,
  ObjectViewInput,
  ObjectViewSort,
  ObjectViewSortDirection,
  ObjectViewVisibility,
  ObjectWorkspaceBase,
} from './object-views'

export const CONTACT_VIEW_VISIBILITIES = OBJECT_VIEW_VISIBILITIES

export type ContactViewVisibility = ObjectViewVisibility

export const CONTACT_VIEW_DENSITIES = OBJECT_VIEW_DENSITIES

export type ContactViewDensity = ObjectViewDensity

export const CONTACT_VIEW_SORT_DIRECTIONS = OBJECT_VIEW_SORT_DIRECTIONS

export type ContactViewSortDirection = ObjectViewSortDirection

export type ContactViewSort = ObjectViewSort

export const CONTACT_COLUMN_MIN_WIDTH = OBJECT_COLUMN_MIN_WIDTH

export const CONTACT_COLUMN_MAX_WIDTH = OBJECT_COLUMN_MAX_WIDTH

export const CONTACT_TABLE_MAX_COLUMNS = OBJECT_TABLE_MAX_COLUMNS

export const CONTACT_TABLE_MAX_PINNED = OBJECT_TABLE_MAX_PINNED

export type ContactViewColumns = ObjectViewColumns

export type ContactView = ObjectView

export const CONTACT_UNASSIGNED_RECENT_DAYS = 30

export type ContactCounts = {
  total: number
  archived: number
  mine: number
  unassigned: number
  unassignedRecent: number
  byStatus: Record<string, number>
}

export type ContactTaxonomyUsage = {
  statuses: Record<string, number>
  sources: Record<string, number>
  lifecycleStages: Record<string, number>
  tags: Record<string, number>
}

export type TaxonomyReassignKind = 'status' | 'source' | 'lifecycle' | 'tag'

export type ContactColumnDef = ObjectColumnDef<ContactSortField>

export type ContactQuickFilterOptions = {
  statuses: string[]
  sources: string[]
  lifecycleStages: string[]
}

export type ContactTableState = ObjectTableState

export type ContactWorkspace = ObjectWorkspaceBase<ContactSortField> & {
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

export type ContactViewInput = ObjectViewInput
