import type { BulkActionKind } from '@repo/shared-types'
import type {
  BatchOutcome,
  BulkActionRow,
  BulkRunContext,
  SnapshotSpec,
} from '../interfaces/bulk-action-row.interfaces'

export const BULK_ACTION_HANDLERS = Symbol('BULK_ACTION_HANDLERS')

export interface BulkActionHandler {
  readonly kinds: ReadonlyArray<BulkActionKind>
  snapshotSpec?(action: BulkActionRow): SnapshotSpec | null
  run(ctx: BulkRunContext, ids: string[]): Promise<BatchOutcome>
}

export function outcomeFromReturnedIds(requested: string[], returned: string[]): BatchOutcome {
  const done = new Set(returned)
  return {
    succeeded: requested.filter((id) => done.has(id)),
    errors: requested.filter((id) => !done.has(id)).map((id) => ({ id, message: 'not_found' })),
  }
}
