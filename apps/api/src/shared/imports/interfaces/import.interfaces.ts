import type { ImportFieldDef, ImportFieldError } from '@repo/shared-types'

export type {
  AnalyzeResult,
  ColumnAnalysis,
  DuplicateStrategy,
  ImportFieldDef,
  ImportFieldError,
  ImportResult,
  PreviewRow,
  ValidationPreview,
} from '@repo/shared-types'

export interface ImportRowMapper {
  fieldDefs: ImportFieldDef[]
  normalizeValue(field: string, value: string): unknown
  validateField(field: string, value: unknown): ImportFieldError | null
  uniqueKeyField: string | null
}
