import { Injectable } from '@nestjs/common'
import type { BulkActionKind } from '@repo/shared-types'
import type { BatchOutcome, BulkRunContext } from '../interfaces/bulk-action-row.interfaces'
import { BulkSnapshotsRepository } from '../repositories/bulk-snapshots.repository'
import { BulkTargetsRepository } from '../repositories/bulk-targets.repository'
import type { BulkActionHandler } from './bulk-action-handler.interface'

@Injectable()
export class RevertHandler implements BulkActionHandler {
  readonly kinds: ReadonlyArray<BulkActionKind> = ['revert']

  constructor(
    private readonly targets: BulkTargetsRepository,
    private readonly snapshots: BulkSnapshotsRepository,
  ) {}

  async run(ctx: BulkRunContext, ids: string[]): Promise<BatchOutcome> {
    const sourceId = ctx.action.params['sourceId'] as string
    const rows = await this.snapshots.findByAction(ctx.schemaName, sourceId, ids)
    const byId = new Map(rows.map((row) => [row.entity_id, row.before]))
    const outcome: BatchOutcome = { succeeded: [], errors: [] }

    for (const id of ids) {
      const before = byId.get(id)
      if (!before) {
        outcome.errors.push({ id, message: 'no_snapshot' })
        continue
      }
      const restored = await this.targets.restoreSnapshot(
        ctx.schemaName,
        ctx.action.entity,
        id,
        before,
      )
      if (restored) outcome.succeeded.push(id)
      else outcome.errors.push({ id, message: 'not_found' })
    }

    return outcome
  }
}
