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
export class AssignHandler implements BulkActionHandler {
  readonly kinds: ReadonlyArray<BulkActionKind> = ['assign']

  constructor(private readonly targets: BulkTargetsRepository) {}

  snapshotSpec(): SnapshotSpec {
    return { columns: ['assigned_to_id'] }
  }

  async run(ctx: BulkRunContext, ids: string[]): Promise<BatchOutcome> {
    const assignedToId = ctx.action.params['assignedToId'] as string
    const returned = await this.targets.assign(ctx.schemaName, ctx.action.entity, ids, assignedToId)
    return outcomeFromReturnedIds(ids, returned)
  }
}
