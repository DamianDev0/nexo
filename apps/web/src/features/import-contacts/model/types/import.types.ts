import type { IMPORT_ISSUE_FILTERS, IMPORT_STEPS } from '../../config/import-contacts.constants'
import type { ImportFieldDef, ValidationPreview } from '@repo/shared-types'

export type ImportStep = (typeof IMPORT_STEPS)[number]

export type ImportIssueFilter = (typeof IMPORT_ISSUE_FILTERS)[number]

export type ImportMapping = Record<string, string | null>

export type ImportMapState = {
  readonly mapping: ImportMapping
  readonly preview: ValidationPreview | null
  readonly missingFields: ImportFieldDef[]
  readonly isPreviewing: boolean
}
