export type ImportFieldDef = {
  field: string
  label: string
  required: boolean
  aliases: string[]
}

export type ColumnAnalysis = {
  csvColumn: string
  suggestedField: string | null
  sampleValues: string[]
  fillRate: number
}

export type ImportFieldError = {
  field: string
  message: string
  value?: string
}

export type PreviewRow = {
  rowNumber: number
  raw: Record<string, string>
  mapped: Record<string, unknown>
  errors: ImportFieldError[]
  isValid: boolean
}

export type ValidationPreview = {
  totalSampleRows: number
  validRows: number
  invalidRows: number
  rows: PreviewRow[]
}

export type AnalyzeResult = {
  fileId: string
  fileName: string
  totalRows: number
  columns: string[]
  sampleRows: Record<string, string>[]
  suggestedMapping: Record<string, string | null>
  availableFields: ImportFieldDef[]
  columnAnalysis: ColumnAnalysis[]
  validationPreview: ValidationPreview
  unmappedColumns: string[]
  missingRequiredFields: string[]
}

export type DuplicateStrategy = 'skip' | 'create' | 'update'

export type ImportResult = {
  imported: number
  updated: number
  skipped: number
  errors: { row: number; message: string }[]
}
