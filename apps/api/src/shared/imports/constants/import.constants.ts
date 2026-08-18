import type { DuplicateStrategy } from '@repo/shared-types'

export const IMPORT_SAMPLE_SIZE = 5

export const IMPORT_MAX_FILE_SIZE = 25 * 1024 * 1024

export const IMPORT_CSV_EXTENSIONS = ['.csv', '.txt'] as const

export const IMPORT_XLSX_EXTENSIONS = ['.xlsx'] as const

export const IMPORT_LEGACY_EXCEL_EXTENSIONS = ['.xls'] as const

export const IMPORT_ACCEPTED_EXTENSIONS = [
  ...IMPORT_CSV_EXTENSIONS,
  ...IMPORT_XLSX_EXTENSIONS,
] as const

export const IMPORT_HEADER_OFFSET = 2

export const DUPLICATE_STRATEGIES: readonly DuplicateStrategy[] = ['skip', 'create', 'update']

export function parseIntOrZero(value: string): number {
  const parsed = Number.parseInt(value.replaceAll(/[^\d-]/g, ''), 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function splitList(value: string): string[] {
  return value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}
