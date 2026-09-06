import { Injectable } from '@nestjs/common'
import type { BulkActionKind, BulkExportFormat, BulkExportParams } from '@repo/shared-types'
import { slugify } from '@repo/shared-utils'
import { S3Service } from '@/shared/integrations/aws/s3.service'
import { S3Category } from '@/shared/integrations/aws/s3.types'
import {
  BULK_EXPORT_FILE_META,
  BULK_EXPORT_URL_TTL_SECONDS,
} from '../constants/bulk-action.constants'
import type { BatchOutcome, BulkRunContext } from '../interfaces/bulk-action-row.interfaces'
import { serializeExport } from '../mappers/export-file.mapper'
import { BulkActionsRepository } from '../repositories/bulk-actions.repository'
import { BulkTargetsRepository } from '../repositories/bulk-targets.repository'
import type { BulkActionHandler } from './bulk-action-handler.interface'

const DEFAULT_FORMAT: BulkExportFormat = 'csv'

type ExportRow = Record<string, unknown>

export function exportFileName(ctx: BulkRunContext, params: BulkExportParams): string {
  const format = params.format ?? DEFAULT_FORMAT
  const base = params.fileName ? slugify(params.fileName) : ''
  const name = base || `${ctx.action.entity}-${ctx.action.id}`
  return `${name}${BULK_EXPORT_FILE_META[format].extension}`
}

@Injectable()
export class ExportHandler implements BulkActionHandler {
  readonly kinds: ReadonlyArray<BulkActionKind> = ['export']

  private readonly buffers = new Map<string, ExportRow[]>()

  constructor(
    private readonly targets: BulkTargetsRepository,
    private readonly actions: BulkActionsRepository,
    private readonly s3: S3Service,
  ) {}

  async run(ctx: BulkRunContext, ids: string[]): Promise<BatchOutcome> {
    const rows = await this.targets.findRowsForExport(ctx.schemaName, ctx.action.entity, ids)
    const seen = new Set(rows.map((row) => row['id'] as string))
    const buffer = this.buffers.get(ctx.action.id) ?? []
    buffer.push(...rows)
    this.buffers.set(ctx.action.id, buffer)

    const done = ctx.action.processed + ids.length >= ctx.action.total
    if (done) await this.flush(ctx, buffer)

    return {
      succeeded: ids.filter((id) => seen.has(id)),
      errors: ids.filter((id) => !seen.has(id)).map((id) => ({ id, message: 'not_found' })),
    }
  }

  private async flush(ctx: BulkRunContext, rows: ExportRow[]): Promise<void> {
    this.buffers.delete(ctx.action.id)
    const params = ctx.action.params as BulkExportParams
    const format = params.format ?? DEFAULT_FORMAT
    const content = await serializeExport(format, rows, params.columns)
    const upload = await this.s3.upload(
      {
        fieldname: 'file',
        originalname: exportFileName(ctx, params),
        mimetype: BULK_EXPORT_FILE_META[format].mimeType,
        size: content.length,
        buffer: content,
      },
      S3Category.BULK_EXPORT,
      ctx.tenantSlug,
    )
    const url = await this.s3.presignedUrl(upload.key, BULK_EXPORT_URL_TTL_SECONDS)
    await this.actions.setResultFile(ctx.schemaName, ctx.action.id, url)
  }
}
