import { Injectable } from '@nestjs/common'
import type { BulkActionKind } from '@repo/shared-types'
import type {
  BatchOutcome,
  BulkRunContext,
  SnapshotSpec,
} from '../interfaces/bulk-action-row.interfaces'
import { BulkTargetsRepository } from '../repositories/bulk-targets.repository'
import { outcomeFromReturnedIds, type BulkActionHandler } from './bulk-action-handler.interface'

@Injectable()
export class ArchiveHandler implements BulkActionHandler {
  readonly kinds: ReadonlyArray<BulkActionKind> = ['archive', 'restore']

  constructor(private readonly targets: BulkTargetsRepository) {}

  snapshotSpec(): SnapshotSpec {
    return { columns: ['is_active'] }
  }

  async run(ctx: BulkRunContext, ids: string[]): Promise<BatchOutcome> {
    const returned =
      ctx.action.action === 'restore'
        ? await this.targets.restore(ctx.schemaName, ctx.action.entity, ids)
        : await this.targets.archive(ctx.schemaName, ctx.action.entity, ids)
    return outcomeFromReturnedIds(ids, returned)
  }
}
