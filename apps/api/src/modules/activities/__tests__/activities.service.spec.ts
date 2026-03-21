import { AuditLogService } from '@/shared/audit-log/audit-log.service'
import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ActivitiesService } from '../activities.service'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { PaginatedActivities } from '@repo/shared-types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SCHEMA = 'tenant_acme'
const ACTIVITY_ID = 'act-1'
const USER_ID = 'user-1'
const CONTACT_ID = 'cnt-1'
const DEAL_ID = 'deal-1'

function makeActivityListRow(overrides: Record<string, unknown> = {}) {
  return {
    id: ACTIVITY_ID,
    activity_type: 'call',
    title: 'Follow up call',
    description: 'Discuss proposal',
    due_date: '2026-04-01T10:00:00Z',
    completed_at: null,
    status: 'pending',
    duration_minutes: 30,
    reminder_at: '2026-04-01T09:30:00Z',
    is_active: true,
    contact_id: CONTACT_ID,
    company_id: null,
    deal_id: DEAL_ID,
    assigned_to_id: USER_ID,
    created_by: USER_ID,
    created_at: '2026-03-20T00:00:00Z',
    updated_at: '2026-03-20T00:00:00Z',
    contact_name: 'Juan Pérez',
    company_name: null,
    deal_title: 'Big Deal',
    assigned_to_name: 'Carlos López',
    ...overrides,
  }
}

// ─── Mock setup ───────────────────────────────────────────────────────────────

function buildQrMock() {
  return { query: jest.fn() }
}

function buildDbMock(qr: ReturnType<typeof buildQrMock>) {
  return {
    query: jest.fn((_schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ActivitiesService', () => {
  let service: ActivitiesService
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(async () => {
    qr = buildQrMock()
    const db = buildDbMock(qr)

    const module = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        { provide: TenantDbService, useValue: db },
        { provide: AuditLogService, useValue: { entityEvent: jest.fn() } },
      ],
    }).compile()

    service = module.get(ActivitiesService)
  })

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns paginated activities', async () => {
      qr.query
        .mockResolvedValueOnce([{ count: '2' }])
        .mockResolvedValueOnce([makeActivityListRow(), makeActivityListRow({ id: 'act-2' })])

      const result: PaginatedActivities = await service.findAll(SCHEMA, {})

      expect(result.total).toBe(2)
      expect(result.data).toHaveLength(2)
      expect(result.page).toBe(1)
    })

    it('applies activity type filter', async () => {
      qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

      await service.findAll(SCHEMA, { activityType: 'meeting' })

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('a.activity_type = $')
    })

    it('applies status filter', async () => {
      qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

      await service.findAll(SCHEMA, { status: 'completed' })

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('a.status = $')
    })

    it('applies entity filters', async () => {
      qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

      await service.findAll(SCHEMA, { contactId: CONTACT_ID, dealId: DEAL_ID })

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('a.contact_id = $')
      expect(sql).toContain('a.deal_id = $')
    })
  })

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns activity with joined names', async () => {
      qr.query.mockResolvedValueOnce([makeActivityListRow()])

      const result = await service.findOne(SCHEMA, ACTIVITY_ID)

      expect(result.id).toBe(ACTIVITY_ID)
      expect(result.activityType).toBe('call')
      expect(result.contactName).toBe('Juan Pérez')
      expect(result.dealTitle).toBe('Big Deal')
    })

    it('throws NotFoundException for missing activity', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.findOne(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('inserts and returns the created activity', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: ACTIVITY_ID }]) // INSERT
        .mockResolvedValueOnce([makeActivityListRow()]) // fetchActivityOrFail

      const result = await service.create(
        SCHEMA,
        {
          activityType: 'call',
          title: 'Follow up call',
          dueDate: '2026-04-01T10:00:00Z',
          contactId: CONTACT_ID,
          dealId: DEAL_ID,
        },
        USER_ID,
      )

      expect(result.title).toBe('Follow up call')
      const insertSql: string = qr.query.mock.calls[0][0] as string
      expect(insertSql).toContain('INSERT INTO activities')
    })

    it('defaults assignedToId to createdById when not provided', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: ACTIVITY_ID }])
        .mockResolvedValueOnce([makeActivityListRow()])

      await service.create(SCHEMA, { activityType: 'note' }, USER_ID)

      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      // assigned_to_id is param index 9 (0-based), should be USER_ID
      expect(params[9]).toBe(USER_ID)
    })
  })

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates fields and returns updated activity', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: ACTIVITY_ID }]) // assertActivityExists
        .mockResolvedValueOnce([]) // UPDATE
        .mockResolvedValueOnce([makeActivityListRow({ title: 'Updated call' })]) // fetch

      const result = await service.update(SCHEMA, ACTIVITY_ID, { title: 'Updated call' })

      expect(result.title).toBe('Updated call')
    })

    it('returns current state when no fields provided', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: ACTIVITY_ID }]) // assertActivityExists
        .mockResolvedValueOnce([makeActivityListRow()]) // fetchActivityOrFail

      const result = await service.update(SCHEMA, ACTIVITY_ID, {})

      expect(result.id).toBe(ACTIVITY_ID)
      // Only 2 queries: assertExists + fetch (no UPDATE)
      expect(qr.query).toHaveBeenCalledTimes(2)
    })
  })

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('soft-deletes by setting is_active = false', async () => {
      qr.query.mockResolvedValueOnce([{ id: ACTIVITY_ID }]).mockResolvedValueOnce([])

      await service.remove(SCHEMA, ACTIVITY_ID)

      const sql: string = qr.query.mock.calls[1][0] as string
      expect(sql).toContain('is_active = false')
    })
  })

  // ─── complete ─────────────────────────────────────────────────────────────

  describe('complete', () => {
    it('sets status to completed and completed_at', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: ACTIVITY_ID }]) // assertExists
        .mockResolvedValueOnce([]) // UPDATE
        .mockResolvedValueOnce([
          makeActivityListRow({ status: 'completed', completed_at: '2026-03-20T12:00:00Z' }),
        ])

      const result = await service.complete(SCHEMA, ACTIVITY_ID)

      expect(result.status).toBe('completed')
      expect(result.completedAt).toBe('2026-03-20T12:00:00Z')

      const updateSql: string = qr.query.mock.calls[1][0] as string
      expect(updateSql).toContain("status = 'completed'")
      expect(updateSql).toContain('completed_at = NOW()')
    })
  })

  // ─── cancel ───────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('sets status to cancelled', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: ACTIVITY_ID }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([makeActivityListRow({ status: 'cancelled' })])

      const result = await service.cancel(SCHEMA, ACTIVITY_ID)

      expect(result.status).toBe('cancelled')
    })
  })

  // ─── reopen ───────────────────────────────────────────────────────────────

  describe('reopen', () => {
    it('sets status back to pending and clears completed_at', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: ACTIVITY_ID }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([makeActivityListRow({ status: 'pending', completed_at: null })])

      const result = await service.reopen(SCHEMA, ACTIVITY_ID)

      expect(result.status).toBe('pending')
      expect(result.completedAt).toBeNull()

      const updateSql: string = qr.query.mock.calls[1][0] as string
      expect(updateSql).toContain("status = 'pending'")
      expect(updateSql).toContain('completed_at = NULL')
    })
  })

  // ─── getCalendar ──────────────────────────────────────────────────────────

  describe('getCalendar', () => {
    it('returns activities within date range', async () => {
      qr.query.mockResolvedValueOnce([
        {
          id: 'act-1',
          activity_type: 'call',
          title: 'Call',
          due_date: '2026-04-01T10:00:00Z',
          status: 'pending',
          contact_name: 'Juan',
          deal_title: null,
          assigned_to_id: USER_ID,
        },
        {
          id: 'act-2',
          activity_type: 'meeting',
          title: 'Meeting',
          due_date: '2026-04-02T14:00:00Z',
          status: 'pending',
          contact_name: null,
          deal_title: 'Big Deal',
          assigned_to_id: USER_ID,
        },
      ])

      const result = await service.getCalendar(SCHEMA, {
        from: '2026-04-01',
        to: '2026-04-07',
      })

      expect(result).toHaveLength(2)
      expect(result[0]?.activityType).toBe('call')
      expect(result[1]?.dealTitle).toBe('Big Deal')
    })

    it('filters by userId when provided', async () => {
      qr.query.mockResolvedValueOnce([])

      await service.getCalendar(SCHEMA, {
        from: '2026-04-01',
        to: '2026-04-07',
        userId: USER_ID,
      })

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('a.assigned_to_id = $')
    })

    it('returns empty array when no activities in range', async () => {
      qr.query.mockResolvedValueOnce([])

      const result = await service.getCalendar(SCHEMA, { from: '2026-04-01', to: '2026-04-07' })

      expect(result).toHaveLength(0)
    })
  })
})
