import { Inject, Injectable, Logger } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import type { Queue } from 'bullmq'
import { DOMAIN_EVENTS } from '@repo/shared-types'
import type { BulkActionKind, BulkActionStatus, NotificationType } from '@repo/shared-types'
import { EventBusService } from '@/shared/events/event-bus.service'
import {
  AUDIT_EVENTS,
  AuditAction,
  AuditEntityEvent,
  AuditEntityType,
} from '@/shared/events/audit.events'
import { QUEUE_NAMES } from '@/shared/queue/queue-names'
import { BULK_BATCH_SIZE } from '../constants/bulk-action.constants'
import {
  BULK_ACTION_HANDLERS,
  type BulkActionHandler,
} from '../handlers/bulk-action-handler.interface'
import type {
  BulkActionJobData,
  BulkActionRow,
  BulkSnapshotRow,
} from '../interfaces/bulk-action-row.interfaces'
import { BulkActionsRepository } from '../repositories/bulk-actions.repository'
import { BulkSnapshotsRepository } from '../repositories/bulk-snapshots.repository'
import { BulkTargetsRepository } from '../repositories/bulk-targets.repository'

const STOP_STATUSES: ReadonlyArray<BulkActionStatus> = ['cancelled', 'paused']

@Injectable()
export class BulkActionRunnerService {
  private readonly logger = new Logger(BulkActionRunnerService.name)
  private readonly handlers = new Map<BulkActionKind, BulkActionHandler>()

  constructor(
    private readonly repository: BulkActionsRepository,
    private readonly snapshots: BulkSnapshotsRepository,
    private readonly targets: BulkTargetsRepository,
    private readonly eventBus: EventBusService,
    @InjectQueue(QUEUE_NAMES.BULK_ACTIONS) private readonly queue: Queue<BulkActionJobData>,
    @Inject(BULK_ACTION_HANDLERS) handlers: BulkActionHandler[],
  ) {
    for (const handler of handlers) {
      for (const kind of handler.kinds) this.handlers.set(kind, handler)
    }
  }

  async enqueue(job: BulkActionJobData, delayMs = 0): Promise<void> {
    const added = await this.queue.add('run', job, {
      delay: delayMs,
      jobId: `${job.bulkActionId}-${Date.now()}`,
    })
    await this.repository.setJobId(job.schemaName, job.bulkActionId, String(added.id))
  }

  async run(job: BulkActionJobData): Promise<void> {
    const { schemaName, bulkActionId } = job
    const started = await this.repository.transition(
      schemaName,
      bulkActionId,
      ['queued', 'paused'],
      'running',
    )
    if (!started) return

    const handler = this.handlers.get(started.action)
    if (!handler) {
      await this.finish(job, started, 'failed')
      return
    }

    let current: BulkActionRow = started
    const drip = started.drip
    let sentSinceDrip = 0

    while (current.processed < current.total) {
      const latest = await this.repository.findById(schemaName, bulkActionId)
      if (!latest || STOP_STATUSES.includes(latest.status)) return
      current = latest

      const batch = current.selection_ids.slice(
        current.processed,
        current.processed + this.batchSize(drip?.batchSize),
      )
      if (batch.length === 0) break

      const before = await this.captureBefore(handler, job.schemaName, current, batch)
      const outcome = await this.safeRun(handler, job, current, batch)
      await this.persistSnapshots(job.schemaName, current.id, before, outcome.succeeded)
      const updated = await this.repository.recordProgress(schemaName, bulkActionId, {
        processed: batch.length,
        succeeded: outcome.succeeded.length,
        failed: outcome.errors.length,
        errors: outcome.errors,
      })
      if (!updated) return
      current = updated
      sentSinceDrip += batch.length

      if (drip && current.processed < current.total && sentSinceDrip >= drip.batchSize) {
        await this.repository.transition(schemaName, bulkActionId, ['running'], 'queued')
        await this.enqueue(job, drip.intervalSeconds * 1000)
        return
      }
    }

    await this.finish(job, current, current.failed > 0 ? 'completed_with_errors' : 'completed')
  }

  async markFailed(job: BulkActionJobData): Promise<void> {
    await this.repository.transition(
      job.schemaName,
      job.bulkActionId,
      ['queued', 'running', 'paused'],
      'failed',
    )
  }

  private async captureBefore(
    handler: BulkActionHandler,
    schemaName: string,
    action: BulkActionRow,
    ids: string[],
  ): Promise<BulkSnapshotRow[]> {
    const spec = handler.snapshotSpec?.(action)
    if (!spec) return []
    return this.targets.readSnapshot(schemaName, action.entity, ids, spec)
  }

  private async persistSnapshots(
    schemaName: string,
    actionId: string,
    before: BulkSnapshotRow[],
    succeeded: string[],
  ): Promise<void> {
    if (before.length === 0) return
    const done = new Set(succeeded)
    await this.snapshots.insertMany(
      schemaName,
      actionId,
      before.filter((row) => done.has(row.entity_id)),
    )
  }

  private batchSize(dripBatch?: number): number {
    return dripBatch ? Math.min(dripBatch, BULK_BATCH_SIZE) : BULK_BATCH_SIZE
  }

  private async safeRun(
    handler: BulkActionHandler,
    job: BulkActionJobData,
    action: BulkActionRow,
    ids: string[],
  ): ReturnType<BulkActionHandler['run']> {
    try {
      return await handler.run(
        { schemaName: job.schemaName, tenantId: job.tenantId, tenantSlug: job.tenantSlug, action },
        ids,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown_error'
      this.logger.error(`Bulk action ${action.id} batch failed: ${message}`)
      return { succeeded: [], errors: ids.map((id) => ({ id, message })) }
    }
  }

  private async finish(
    job: BulkActionJobData,
    action: BulkActionRow,
    status: 'completed' | 'completed_with_errors' | 'failed',
  ): Promise<void> {
    const finished = await this.repository.transition(
      job.schemaName,
      action.id,
      ['running'],
      status,
    )
    if (!finished) return

    this.eventBus.emit(
      AUDIT_EVENTS.ENTITY,
      new AuditEntityEvent(
        job.schemaName,
        AuditAction.BulkActionCompleted,
        AuditEntityType.BulkAction,
        finished.id,
        finished.created_by,
        `Bulk ${finished.action} on ${finished.entity}: ${finished.succeeded} ok, ${finished.failed} failed`,
      ),
    )
    this.eventBus.emit(DOMAIN_EVENTS.BULK_ACTION_COMPLETED, {
      schemaName: job.schemaName,
      tenantId: job.tenantId,
      userId: finished.created_by,
      type: DOMAIN_EVENTS.BULK_ACTION_COMPLETED as NotificationType,
      title: `Acción masiva ${finished.action} terminada`,
      body: `${finished.succeeded} procesados, ${finished.failed} con error`,
      entityType: 'bulk_action',
      entityId: finished.id,
      data: {
        action: finished.action,
        succeeded: finished.succeeded,
        failed: finished.failed,
        total: finished.total,
      },
    })
  }
}
