import { Injectable } from '@nestjs/common'
import type { BulkActionKind } from '@repo/shared-types'
import { S3Service } from '@/shared/integrations/aws/s3.service'
import { S3Category } from '@/shared/integrations/aws/s3.types'
import {
  BULK_EXPORT_HIDDEN_COLUMNS,
  BULK_EXPORT_URL_TTL_SECONDS,
} from '../constants/bulk-action.constants'
import type { BatchOutcome, BulkRunContext } from '../interfaces/bulk-action-row.interfaces'
import { BulkActionsRepository } from '../repositories/bulk-actions.repository'
import { BulkTargetsRepository } from '../repositories/bulk-targets.repository'
import type { BulkActionHandler } from './bulk-action-handler.interface'

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function toCsv(rows: ReadonlyArray<Record<string, unknown>>, columns?: string[]): string {
  const first = rows[0]
  const headers = (columns?.length ? columns : first ? Object.keys(first) : []).filter(
    (column) => !BULK_EXPORT_HIDDEN_COLUMNS.has(column),
  )
  const lines = rows.map((row) => headers.map((column) => csvCell(row[column])).join(','))
  return [headers.join(','), ...lines].join('\n')
}

@Injectable()
export class ExportHandler implements BulkActionHandler {
  readonly kinds: ReadonlyArray<BulkActionKind> = ['export']

  private readonly chunks = new Map<string, string[]>()

  constructor(
    private readonly targets: BulkTargetsRepository,
    private readonly actions: BulkActionsRepository,
    private readonly s3: S3Service,
  ) {}

  async run(ctx: BulkRunContext, ids: string[]): Promise<BatchOutcome> {
    const rows = await this.targets.findRowsForExport(ctx.schemaName, ctx.action.entity, ids)
    const columns = ctx.action.params['columns'] as string[] | undefined
    const seen = new Set(rows.map((row) => row['id'] as string))
    const buffer = this.chunks.get(ctx.action.id) ?? []
    const csv = toCsv(rows, columns)
    buffer.push(buffer.length === 0 ? csv : csv.split('\n').slice(1).join('\n'))
    this.chunks.set(ctx.action.id, buffer)

    const done = ctx.action.processed + ids.length >= ctx.action.total
    if (done) await this.flush(ctx, buffer)

    return {
      succeeded: ids.filter((id) => seen.has(id)),
      errors: ids.filter((id) => !seen.has(id)).map((id) => ({ id, message: 'not_found' })),
    }
  }

  private async flush(ctx: BulkRunContext, buffer: string[]): Promise<void> {
    this.chunks.delete(ctx.action.id)
    const content = Buffer.from(buffer.filter((chunk) => chunk.length > 0).join('\n'), 'utf8')
    const upload = await this.s3.upload(
      {
        fieldname: 'file',
        originalname: `${ctx.action.entity}-${ctx.action.id}.csv`,
        mimetype: 'text/csv',
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
