import type { BulkExportFormat } from '@repo/shared-types'

export const BULK_ACTIONABLE_TOAST_DURATION_MS = 9000

export const BULK_ACTIONABLE_TOAST_AUTOPILOT = { expand: 300, collapse: 7000 } as const

export const BULK_EXPORT_FORMAT_OPTIONS: ReadonlyArray<{
  readonly value: BulkExportFormat
  readonly labelKey: string
}> = [
  { value: 'xlsx', labelKey: 'contacts.bulk.dialogs.export.formats.xlsx' },
  { value: 'csv', labelKey: 'contacts.bulk.dialogs.export.formats.csv' },
  { value: 'json', labelKey: 'contacts.bulk.dialogs.export.formats.json' },
]
