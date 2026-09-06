import { Injectable } from '@nestjs/common'
import type { BulkActionKind } from '@repo/shared-types'
import {
  BULK_CUSTOM_FIELD_PREFIX,
  BULK_SNAPSHOT_COLUMN_BY_FIELD,
} from '../constants/bulk-action.constants'
import type {
  BatchOutcome,
  BulkActionRow,
  BulkRunContext,
  SnapshotSpec,
} from '../interfaces/bulk-action-row.interfaces'
import { BulkTargetsRepository } from '../repositories/bulk-targets.repository'
import { outcomeFromReturnedIds, type BulkActionHandler } from './bulk-action-handler.interface'

@Injectable()
export class UpdateFieldHandler implements BulkActionHandler {
  readonly kinds: ReadonlyArray<BulkActionKind> = ['update_field']

  constructor(private readonly targets: BulkTargetsRepository) {}

  snapshotSpec(action: BulkActionRow): SnapshotSpec | null {
    const field = action.params['field'] as string
    if (field.startsWith(BULK_CUSTOM_FIELD_PREFIX)) {
      return { columns: [], customKey: field.slice(BULK_CUSTOM_FIELD_PREFIX.length) }
    }
    const column = BULK_SNAPSHOT_COLUMN_BY_FIELD[field]
    return column ? { columns: [column] } : null
  }

  async run(ctx: BulkRunContext, ids: string[]): Promise<BatchOutcome> {
    const field = ctx.action.params['field'] as string
    const value = ctx.action.params['value']
    const returned = field.startsWith(BULK_CUSTOM_FIELD_PREFIX)
      ? await this.targets.updateContactCustomField(
          ctx.schemaName,
          ids,
          field.slice(BULK_CUSTOM_FIELD_PREFIX.length),
          value,
        )
      : await this.targets.updateContactColumn(ctx.schemaName, ids, field, value)
    return outcomeFromReturnedIds(ids, returned)
  }
}
