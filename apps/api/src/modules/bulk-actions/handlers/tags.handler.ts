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
export class TagsHandler implements BulkActionHandler {
  readonly kinds: ReadonlyArray<BulkActionKind> = ['add_tags', 'remove_tags']

  constructor(private readonly targets: BulkTargetsRepository) {}

  snapshotSpec(): SnapshotSpec {
    return { columns: ['tags'] }
  }

  async run(ctx: BulkRunContext, ids: string[]): Promise<BatchOutcome> {
    const tags = ctx.action.params['tags'] as string[]
    const returned =
      ctx.action.action === 'add_tags'
        ? await this.targets.addTags(ctx.schemaName, ctx.action.entity, ids, tags)
        : await this.targets.removeTags(ctx.schemaName, ctx.action.entity, ids, tags)
    return outcomeFromReturnedIds(ids, returned)
  }
}
