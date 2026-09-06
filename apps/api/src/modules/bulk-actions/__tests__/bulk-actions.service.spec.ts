import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PlanName, UserRole } from '@repo/shared-types'
import type { AuthenticatedUser, TenantContext } from '@repo/shared-types'
import { EventBusService } from '@/shared/events/event-bus.service'
import { AuditAction, type AuditEntityEvent } from '@/shared/events/audit.events'
import { BulkActionsService } from '../services/bulk-actions.service'
import { BulkActionRunnerService } from '../services/bulk-action-runner.service'
import { BulkActionsRepository } from '../repositories/bulk-actions.repository'
import { BulkSnapshotsRepository } from '../repositories/bulk-snapshots.repository'
import { BulkTargetsRepository } from '../repositories/bulk-targets.repository'
import type { BulkActionRow } from '../interfaces/bulk-action-row.interfaces'

const ID_A = '11111111-1111-4111-8111-111111111111'
const ID_B = '22222222-2222-4222-8222-222222222222'
const USER_ID = '33333333-3333-4333-8333-333333333333'

const ctx: TenantContext = {
  tenantId: 'tenant-1',
  slug: 'acme',
  schemaName: 'tenant_acme',
  plan: PlanName.STARTER,
  config: {},
  productName: 'NexoCRM',
  customDomain: null,
}

function user(role: UserRole = UserRole.MANAGER): AuthenticatedUser {
  return { id: USER_ID, email: 'u@acme.co', role, tenantId: 'tenant-1', schemaName: 'tenant_acme' }
}

function row(overrides: Partial<BulkActionRow> = {}): BulkActionRow {
  return {
    id: 'ba-1',
    entity: 'contacts',
    action: 'add_tags',
    params: { tags: ['vip'] },
    selection_mode: 'ids',
    selection_ids: [ID_A, ID_B],
    selection_query: null,
    status: 'queued',
    total: 2,
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [],
    result_file_url: null,
    drip: null,
    job_id: null,
    reverted_at: null,
    reverts_id: null,
    created_by: USER_ID,
    started_at: null,
    finished_at: null,
    created_at: '2026-09-05T00:00:00Z',
    updated_at: '2026-09-05T00:00:00Z',
    ...overrides,
  }
}

describe('BulkActionsService', () => {
  let service: BulkActionsService
  let repository: {
    insert: jest.Mock
    findById: jest.Mock
    findPage: jest.Mock
    countActive: jest.Mock
    transition: jest.Mock
    markReverted: jest.Mock
  }
  let targets: { resolveContactIds: jest.Mock }
  let snapshots: { findByAction: jest.Mock }
  let runner: { enqueue: jest.Mock }
  let eventBus: { emit: jest.Mock }

  beforeEach(async () => {
    repository = {
      insert: jest
        .fn()
        .mockImplementation((_s, data) =>
          Promise.resolve(row({ ...data, selection_ids: data.selectionIds })),
        ),
      findById: jest.fn().mockResolvedValue(row()),
      findPage: jest.fn().mockResolvedValue({ rows: [row()], total: 1 }),
      countActive: jest.fn().mockResolvedValue(0),
      transition: jest.fn().mockResolvedValue(row({ status: 'cancelled' })),
      markReverted: jest.fn(),
    }
    targets = { resolveContactIds: jest.fn().mockResolvedValue([ID_A]) }
    snapshots = {
      findByAction: jest.fn().mockResolvedValue([{ entity_id: ID_A, before: { tags: [] } }]),
    }
    runner = { enqueue: jest.fn() }
    eventBus = { emit: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        BulkActionsService,
        { provide: BulkActionsRepository, useValue: repository },
        { provide: BulkTargetsRepository, useValue: targets },
        { provide: BulkSnapshotsRepository, useValue: snapshots },
        { provide: BulkActionRunnerService, useValue: runner },
        { provide: EventBusService, useValue: eventBus },
      ],
    }).compile()
    service = module.get(BulkActionsService)
  })

  describe('create', () => {
    it('persists the action with the actor from the token, dedupes ids and enqueues the job', async () => {
      const result = await service.create(ctx, user(), {
        entity: 'contacts',
        action: 'add_tags',
        params: { tags: ['vip'] },
        selection: { mode: 'ids', ids: [ID_A, ID_A, ID_B] },
      })

      expect(repository.insert).toHaveBeenCalledWith(
        ctx.schemaName,
        expect.objectContaining({ createdBy: USER_ID, selectionIds: [ID_A, ID_B], total: 2 }),
      )
      expect(runner.enqueue).toHaveBeenCalledWith({
        bulkActionId: 'ba-1',
        schemaName: ctx.schemaName,
        tenantId: ctx.tenantId,
        tenantSlug: ctx.slug,
      })
      expect(result.createdById).toBe(USER_ID)
      const event = eventBus.emit.mock.calls[0][1] as AuditEntityEvent
      expect(event.action).toBe(AuditAction.BulkActionStarted)
    })

    it('resolves filter selections against the contact query and stores the query', async () => {
      await service.create(ctx, user(), {
        entity: 'contacts',
        action: 'archive',
        selection: { mode: 'filter', query: { status: 'lost' } },
      })

      expect(targets.resolveContactIds).toHaveBeenCalledWith(
        ctx.schemaName,
        { status: 'lost' },
        100_000,
      )
      expect(repository.insert).toHaveBeenCalledWith(
        ctx.schemaName,
        expect.objectContaining({
          selectionMode: 'filter',
          selectionQuery: { status: 'lost' },
          total: 1,
        }),
      )
    })

    it('rejects filter selections on entities other than contacts', async () => {
      await expect(
        service.create(ctx, user(), {
          entity: 'deals',
          action: 'archive',
          selection: { mode: 'filter', query: {} },
        }),
      ).rejects.toThrow(BadRequestException)
    })

    it('refuses roles below the action minimum', async () => {
      await expect(
        service.create(ctx, user(UserRole.SALES_REP), {
          entity: 'contacts',
          action: 'archive',
          selection: { mode: 'ids', ids: [ID_A] },
        }),
      ).rejects.toThrow(ForbiddenException)
    })

    it('refuses actions not available for the entity', async () => {
      await expect(
        service.create(ctx, user(), {
          entity: 'deals',
          action: 'send_email',
          params: { templateId: ID_A },
          selection: { mode: 'ids', ids: [ID_A] },
        }),
      ).rejects.toThrow(/not available/)
    })

    it('caps concurrent bulk actions per tenant', async () => {
      repository.countActive.mockResolvedValue(5)

      await expect(
        service.create(ctx, user(), {
          entity: 'contacts',
          action: 'archive',
          selection: { mode: 'ids', ids: [ID_A] },
        }),
      ).rejects.toThrow(/Too many/)
      expect(runner.enqueue).not.toHaveBeenCalled()
    })

    it('validates update_field against the tenant taxonomy from the context', async () => {
      const withTaxonomy: TenantContext = {
        ...ctx,
        config: {
          contactTaxonomy: {
            statuses: [{ key: 'client', enabled: true }],
            sources: [],
            lifecycleStages: [],
          },
        },
      }

      await expect(
        service.create(withTaxonomy, user(), {
          entity: 'contacts',
          action: 'update_field',
          params: { field: 'status', value: 'ghost' },
          selection: { mode: 'ids', ids: [ID_A] },
        }),
      ).rejects.toThrow(/not an enabled status/)

      await service.create(withTaxonomy, user(), {
        entity: 'contacts',
        action: 'update_field',
        params: { field: 'status', value: 'client' },
        selection: { mode: 'ids', ids: [ID_A] },
      })
      expect(runner.enqueue).toHaveBeenCalledTimes(1)
    })

    it('rejects update_field on columns outside the allowlist and unknown custom fields', async () => {
      await expect(
        service.create(ctx, user(), {
          entity: 'contacts',
          action: 'update_field',
          params: { field: 'email', value: 'x@y.co' },
          selection: { mode: 'ids', ids: [ID_A] },
        }),
      ).rejects.toThrow(/cannot be bulk-updated/)

      await expect(
        service.create(ctx, user(), {
          entity: 'contacts',
          action: 'update_field',
          params: { field: 'custom:eps', value: 'Sura' },
          selection: { mode: 'ids', ids: [ID_A] },
        }),
      ).rejects.toThrow(/Unknown custom field/)
    })

    it('requires a template id for send actions and a user id for assign', async () => {
      await expect(
        service.create(ctx, user(UserRole.MARKETING), {
          entity: 'contacts',
          action: 'send_whatsapp',
          params: {},
          selection: { mode: 'ids', ids: [ID_A] },
        }),
      ).rejects.toThrow(/templateId/)

      await expect(
        service.create(ctx, user(), {
          entity: 'companies',
          action: 'assign',
          params: { assignedToId: 'nope' },
          selection: { mode: 'ids', ids: [ID_A] },
        }),
      ).rejects.toThrow(/assignedToId/)
    })
  })

  describe('revert', () => {
    it('queues a revert action over the snapshotted ids and marks the source as reverted', async () => {
      repository.findById.mockResolvedValue(row({ status: 'completed', succeeded: 2 }))

      const result = await service.revert(ctx, user(), 'ba-1')

      expect(repository.insert).toHaveBeenCalledWith(
        ctx.schemaName,
        expect.objectContaining({
          action: 'revert',
          params: { sourceId: 'ba-1', sourceAction: 'add_tags' },
          selectionIds: [ID_A],
          total: 1,
          revertsId: 'ba-1',
          createdBy: USER_ID,
        }),
      )
      expect(repository.markReverted).toHaveBeenCalledWith(ctx.schemaName, 'ba-1')
      expect(runner.enqueue).toHaveBeenCalledWith(expect.objectContaining({ bulkActionId: 'ba-1' }))
      expect(result.action).toBe('revert')
    })

    it('refuses exports, unfinished runs, double reverts and actions without snapshots', async () => {
      repository.findById.mockResolvedValue(row({ action: 'export', status: 'completed' }))
      await expect(service.revert(ctx, user(), 'ba-1')).rejects.toThrow(/cannot be reverted/)

      repository.findById.mockResolvedValue(row({ status: 'running' }))
      await expect(service.revert(ctx, user(), 'ba-1')).rejects.toThrow(/finished/)

      repository.findById.mockResolvedValue(row({ status: 'completed', reverted_at: '2026-09-05' }))
      await expect(service.revert(ctx, user(), 'ba-1')).rejects.toThrow(/already reverted/)

      repository.findById.mockResolvedValue(row({ status: 'completed' }))
      snapshots.findByAction.mockResolvedValue([])
      await expect(service.revert(ctx, user(), 'ba-1')).rejects.toThrow(/no snapshots/)
      expect(runner.enqueue).not.toHaveBeenCalled()
    })

    it('never accepts revert as a directly created action', async () => {
      await expect(
        service.create(ctx, user(), {
          entity: 'contacts',
          action: 'revert',
          selection: { mode: 'ids', ids: [ID_A] },
        }),
      ).rejects.toThrow(/\/revert/)
    })
  })

  describe('lifecycle', () => {
    it('returns 404 for unknown ids so cross-tenant lookups never leak', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findOne(ctx.schemaName, 'ba-x')).rejects.toThrow(NotFoundException)
      await expect(service.cancel(ctx.schemaName, 'ba-x', USER_ID)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('cancels active actions and audits the actor', async () => {
      const result = await service.cancel(ctx.schemaName, 'ba-1', 'admin-1')

      expect(repository.transition).toHaveBeenCalledWith(
        ctx.schemaName,
        'ba-1',
        ['queued', 'running', 'paused'],
        'cancelled',
      )
      expect(result.status).toBe('cancelled')
      const event = eventBus.emit.mock.calls[0][1] as AuditEntityEvent
      expect(event.action).toBe(AuditAction.BulkActionCancelled)
      expect(event.userId).toBe('admin-1')
    })

    it('rejects cancelling a finished action', async () => {
      repository.transition.mockResolvedValue(null)

      await expect(service.cancel(ctx.schemaName, 'ba-1', USER_ID)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('resume re-enqueues only paused actions', async () => {
      repository.findById.mockResolvedValue(row({ status: 'running' }))
      await expect(service.resume(ctx, 'ba-1')).rejects.toThrow(/paused/)

      repository.findById.mockResolvedValue(row({ status: 'paused' }))
      await service.resume(ctx, 'ba-1')
      expect(runner.enqueue).toHaveBeenCalledWith(expect.objectContaining({ bulkActionId: 'ba-1' }))
    })

    it('lists history with pagination defaults', async () => {
      const page = await service.findAll(ctx.schemaName, {})

      expect(repository.findPage).toHaveBeenCalledWith(
        ctx.schemaName,
        expect.objectContaining({ page: 1, limit: expect.any(Number) }),
      )
      expect(page.data[0]?.id).toBe('ba-1')
      expect(page.total).toBe(1)
    })
  })
})
