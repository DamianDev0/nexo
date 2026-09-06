import { Test } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { DOMAIN_EVENTS } from '@repo/shared-types'
import { EventBusService } from '@/shared/events/event-bus.service'
import { AuditAction, AuditEntityEvent } from '@/shared/events/audit.events'
import { QUEUE_NAMES } from '@/shared/queue/queue-names'
import { BULK_ACTION_HANDLERS } from '../handlers/bulk-action-handler.interface'
import type { BulkActionHandler } from '../handlers/bulk-action-handler.interface'
import type { BulkActionJobData, BulkActionRow } from '../interfaces/bulk-action-row.interfaces'
import { BulkActionsRepository } from '../repositories/bulk-actions.repository'
import { BulkSnapshotsRepository } from '../repositories/bulk-snapshots.repository'
import { BulkTargetsRepository } from '../repositories/bulk-targets.repository'
import { BulkActionRunnerService } from '../services/bulk-action-runner.service'

const JOB: BulkActionJobData = {
  bulkActionId: 'ba-1',
  schemaName: 'tenant_acme',
  tenantId: 'tenant-1',
  tenantSlug: 'acme',
}

function row(overrides: Partial<BulkActionRow> = {}): BulkActionRow {
  return {
    id: 'ba-1',
    entity: 'contacts',
    action: 'add_tags',
    params: { tags: ['vip'] },
    selection_mode: 'ids',
    selection_ids: ['a', 'b', 'c'],
    selection_query: null,
    status: 'running',
    total: 3,
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [],
    result_file_url: null,
    drip: null,
    job_id: null,
    reverted_at: null,
    reverts_id: null,
    created_by: 'user-1',
    started_at: null,
    finished_at: null,
    created_at: '2026-09-05T00:00:00Z',
    updated_at: '2026-09-05T00:00:00Z',
    ...overrides,
  }
}

describe('BulkActionRunnerService', () => {
  let runner: BulkActionRunnerService
  let repository: {
    transition: jest.Mock
    findById: jest.Mock
    recordProgress: jest.Mock
    setJobId: jest.Mock
  }
  let handler: { kinds: string[]; run: jest.Mock; snapshotSpec?: jest.Mock }
  let queue: { add: jest.Mock }
  let eventBus: { emit: jest.Mock }
  let snapshots: { insertMany: jest.Mock }
  let targets: { readSnapshot: jest.Mock }

  beforeEach(async () => {
    let state = row()
    repository = {
      transition: jest.fn().mockImplementation((_s, _id, _from, to) => {
        state = { ...state, status: to }
        return Promise.resolve(state)
      }),
      findById: jest.fn().mockImplementation(() => Promise.resolve(state)),
      recordProgress: jest.fn().mockImplementation((_s, _id, patch) => {
        state = {
          ...state,
          processed: state.processed + patch.processed,
          succeeded: state.succeeded + patch.succeeded,
          failed: state.failed + patch.failed,
          errors: [...state.errors, ...patch.errors],
        }
        return Promise.resolve(state)
      }),
      setJobId: jest.fn(),
    }
    handler = {
      kinds: ['add_tags'],
      run: jest.fn().mockImplementation((_ctx, ids: string[]) =>
        Promise.resolve({
          succeeded: ids.filter((id) => id !== 'b'),
          errors: ids.filter((id) => id === 'b').map((id) => ({ id, message: 'not_found' })),
        }),
      ),
    }
    queue = { add: jest.fn().mockResolvedValue({ id: 'job-1' }) }
    eventBus = { emit: jest.fn() }
    snapshots = { insertMany: jest.fn() }
    targets = {
      readSnapshot: jest
        .fn()
        .mockImplementation((_s, _e, ids: string[]) =>
          Promise.resolve(ids.map((id) => ({ entity_id: id, before: { tags: ['old'] } }))),
        ),
    }

    const module = await Test.createTestingModule({
      providers: [
        BulkActionRunnerService,
        { provide: BulkActionsRepository, useValue: repository },
        { provide: BulkSnapshotsRepository, useValue: snapshots },
        { provide: BulkTargetsRepository, useValue: targets },
        { provide: EventBusService, useValue: eventBus },
        { provide: getQueueToken(QUEUE_NAMES.BULK_ACTIONS), useValue: queue },
        { provide: BULK_ACTION_HANDLERS, useValue: [handler as unknown as BulkActionHandler] },
      ],
    }).compile()
    runner = module.get(BulkActionRunnerService)
  })

  it('runs every target through the handler, records progress and finishes with errors flagged', async () => {
    await runner.run(JOB)

    expect(repository.transition).toHaveBeenCalledWith(
      JOB.schemaName,
      'ba-1',
      ['queued', 'paused'],
      'running',
    )
    expect(handler.run).toHaveBeenCalledWith(
      expect.objectContaining({ schemaName: JOB.schemaName, tenantSlug: 'acme' }),
      ['a', 'b', 'c'],
    )
    expect(repository.recordProgress).toHaveBeenCalledWith(JOB.schemaName, 'ba-1', {
      processed: 3,
      succeeded: 2,
      failed: 1,
      errors: [{ id: 'b', message: 'not_found' }],
    })
    expect(repository.transition).toHaveBeenLastCalledWith(
      JOB.schemaName,
      'ba-1',
      ['running'],
      'completed_with_errors',
    )
    const audit = eventBus.emit.mock.calls.find(
      (call) => call[1] instanceof AuditEntityEvent,
    )?.[1] as AuditEntityEvent
    expect(audit.action).toBe(AuditAction.BulkActionCompleted)
    expect(audit.userId).toBe('user-1')
    expect(eventBus.emit).toHaveBeenCalledWith(
      DOMAIN_EVENTS.BULK_ACTION_COMPLETED,
      expect.objectContaining({ userId: 'user-1', entityId: 'ba-1' }),
    )
  })

  it('keeps a before-snapshot only for the rows the handler actually changed', async () => {
    handler.snapshotSpec = jest.fn().mockReturnValue({ columns: ['tags'] })

    await runner.run(JOB)

    expect(targets.readSnapshot).toHaveBeenCalledWith(JOB.schemaName, 'contacts', ['a', 'b', 'c'], {
      columns: ['tags'],
    })
    expect(snapshots.insertMany).toHaveBeenCalledWith(JOB.schemaName, 'ba-1', [
      { entity_id: 'a', before: { tags: ['old'] } },
      { entity_id: 'c', before: { tags: ['old'] } },
    ])
  })

  it('skips snapshots for handlers that cannot be reverted', async () => {
    await runner.run(JOB)

    expect(targets.readSnapshot).not.toHaveBeenCalled()
    expect(snapshots.insertMany).not.toHaveBeenCalled()
  })

  it('does nothing when the action is no longer queued or paused', async () => {
    repository.transition.mockResolvedValueOnce(null)

    await runner.run(JOB)

    expect(handler.run).not.toHaveBeenCalled()
  })

  it('stops between batches once the action is cancelled', async () => {
    repository.findById.mockResolvedValueOnce(row({ status: 'cancelled' }))

    await runner.run(JOB)

    expect(handler.run).not.toHaveBeenCalled()
    expect(repository.recordProgress).not.toHaveBeenCalled()
  })

  it('fails the action when no handler is registered for its kind', async () => {
    repository.transition.mockResolvedValueOnce(row({ action: 'export' }))

    await runner.run(JOB)

    expect(repository.transition).toHaveBeenLastCalledWith(
      JOB.schemaName,
      'ba-1',
      ['running'],
      'failed',
    )
  })

  it('converts a handler crash into per-row errors instead of losing the batch', async () => {
    handler.run.mockRejectedValueOnce(new Error('db down'))

    await runner.run(JOB)

    expect(repository.recordProgress).toHaveBeenCalledWith(
      JOB.schemaName,
      'ba-1',
      expect.objectContaining({
        failed: 3,
        errors: expect.arrayContaining([{ id: 'a', message: 'db down' }]),
      }),
    )
  })

  it('re-enqueues with a delay after each drip batch instead of blasting everything', async () => {
    repository.transition.mockResolvedValueOnce(
      row({ drip: { batchSize: 2, intervalSeconds: 60 } }),
    )

    await runner.run(JOB)

    expect(handler.run).toHaveBeenCalledTimes(1)
    expect(handler.run).toHaveBeenCalledWith(expect.anything(), ['a', 'b'])
    expect(queue.add).toHaveBeenCalledWith(
      'run',
      JOB,
      expect.objectContaining({ delay: 60_000, jobId: expect.not.stringContaining(':') }),
    )
    expect(repository.transition).toHaveBeenLastCalledWith(
      JOB.schemaName,
      'ba-1',
      ['running'],
      'queued',
    )
  })
})
