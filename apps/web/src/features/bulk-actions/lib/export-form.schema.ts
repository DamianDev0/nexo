import { BULK_EXPORT_FILE_NAME_MAX, BULK_EXPORT_FORMATS } from '@repo/shared-types'
import { z } from 'zod'

import { defaultExportFileName } from './export-file-name'

import type { BulkExportFormat, BulkExportParams, CustomFieldEntity } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export type ExportFormValues = {
  readonly format: BulkExportFormat
  readonly fileName: string
}

export const EXPORT_DEFAULT_FORMAT: BulkExportFormat = 'xlsx'

export function exportFormDefaults(entity: CustomFieldEntity, now?: Date): ExportFormValues {
  return { format: EXPORT_DEFAULT_FORMAT, fileName: defaultExportFileName(entity, now) }
}

export function buildExportFormSchema(t: TFunction) {
  return z.object({
    format: z.enum(BULK_EXPORT_FORMATS),
    fileName: z
      .string()
      .trim()
      .max(
        BULK_EXPORT_FILE_NAME_MAX,
        t('contacts.bulk.dialogs.export.fileNameTooLong', { max: BULK_EXPORT_FILE_NAME_MAX }),
      ),
  })
}

export function toExportParams(values: ExportFormValues): BulkExportParams {
  const fileName = values.fileName.trim()
  return fileName ? { format: values.format, fileName } : { format: values.format }
}
