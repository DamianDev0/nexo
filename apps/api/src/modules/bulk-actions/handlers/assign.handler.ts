import { Injectable } from '@nestjs/common'
import { DOMAIN_EVENTS, NotificationType } from '@repo/shared-types'
import type { BulkActionKind } from '@repo/shared-types'
import { EventBusService } from '@/shared/events/event-bus.service'
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

  constructor(
    private readonly targets: BulkTargetsRepository,
    private readonly eventBus: EventBusService,
  ) {}

  snapshotSpec(): SnapshotSpec {
    return { columns: ['assigned_to_id'] }
  }

  async run(ctx: BulkRunContext, ids: string[]): Promise<BatchOutcome> {
    const assignedToId = ctx.action.params['assignedToId'] as string
    const returned = await this.targets.assign(ctx.schemaName, ctx.action.entity, ids, assignedToId)
    if (returned.length > 0 && assignedToId !== ctx.action.created_by) {
      this.eventBus.emit(DOMAIN_EVENTS.CONTACT_ASSIGNED, {
        schemaName: ctx.schemaName,
        tenantId: ctx.tenantId,
        userId: assignedToId,
        type: NotificationType.CONTACT_ASSIGNED,
        title: `Te asignaron ${returned.length} contactos`,
        entityType: 'bulk_action',
        entityId: ctx.action.id,
        data: { count: returned.length, assignedById: ctx.action.created_by },
      })
    }
    return outcomeFromReturnedIds(ids, returned)
  }
}
