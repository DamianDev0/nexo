import { AuditLogService } from '@/shared/audit-log/audit-log.service'
import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ContactsService } from '../contacts.service'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { Contact, PaginatedContacts } from '@repo/shared-types'
import { ContactStatus, ContactSource } from '@repo/shared-types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SCHEMA = 'tenant_acme'

function makeContactRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'c-1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '3001234567',
    whatsapp: null,
    document_type: 'cc',
    document_number: '123456789',
    city: 'Bogotá',
    department: 'Cundinamarca',
    municipio_code: '11001',
    status: 'new',
    source: 'manual',
    lead_score: 0,
    tags: [],
    company_id: null,
    assigned_to_id: null,
    custom_fields: {},
    is_active: true,
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: 'c-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '3001234567',
    whatsapp: null,
    documentType: 'cc' as Contact['documentType'],
    documentNumber: '123456789',
    city: 'Bogotá',
    department: 'Cundinamarca',
    municipioCode: '11001',
    status: ContactStatus.NEW,
    source: ContactSource.MANUAL,
    leadScore: 0,
    tags: [],
    companyId: null,
    assignedToId: null,
    customFields: {},
    isActive: true,
    createdById: 'user-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

// ─── Mock setup ───────────────────────────────────────────────────────────────

function buildQrMock(overrides: Record<string, jest.Mock> = {}) {
  return { query: jest.fn(), ...overrides }
}

function buildDbMock(qr: ReturnType<typeof buildQrMock>) {
  return {
    query: jest.fn((schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
    transactional: jest.fn((schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ContactsService', () => {
  let service: ContactsService
  let db: ReturnType<typeof buildDbMock>
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(async () => {
    qr = buildQrMock()
    db = buildDbMock(qr)

    const module = await Test.createTestingModule({
      providers: [
        ContactsService,
        { provide: TenantDbService, useValue: db },
        { provide: AuditLogService, useValue: { entityEvent: jest.fn() } },
      ],
    }).compile()

    service = module.get(ContactsService)
  })

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns paginated contacts with defaults', async () => {
      qr.query
        .mockResolvedValueOnce([{ count: '2' }])
        .mockResolvedValueOnce([makeContactRow(), makeContactRow({ id: 'c-2' })])

      const result: PaginatedContacts = await service.findAll(SCHEMA, {})

      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(25)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]?.firstName).toBe('John')
    })

    it('applies page and limit correctly', async () => {
      qr.query.mockResolvedValueOnce([{ count: '50' }]).mockResolvedValueOnce([makeContactRow()])

      const result = await service.findAll(SCHEMA, { page: 3, limit: 10 })

      expect(result.page).toBe(3)
      expect(result.limit).toBe(10)
      // Verify OFFSET was calculated as (3-1)*10=20
      const listQuery: string = qr.query.mock.calls[1][0] as string
      expect(listQuery).toContain('OFFSET')
    })

    it('applies status filter to WHERE clause', async () => {
      qr.query
        .mockResolvedValueOnce([{ count: '1' }])
        .mockResolvedValueOnce([makeContactRow({ status: 'qualified' })])

      await service.findAll(SCHEMA, { status: ContactStatus.QUALIFIED })

      const countQuery: string = qr.query.mock.calls[0][0] as string
      expect(countQuery).toContain('status = $')
      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContain(ContactStatus.QUALIFIED)
    })

    it('applies full-text search filter', async () => {
      qr.query.mockResolvedValueOnce([{ count: '1' }]).mockResolvedValueOnce([makeContactRow()])

      await service.findAll(SCHEMA, { q: 'john' })

      const countQuery: string = qr.query.mock.calls[0][0] as string
      expect(countQuery).toContain('plainto_tsquery')
      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContain('john')
    })

    it('returns empty data when no contacts match', async () => {
      qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

      const result = await service.findAll(SCHEMA, { status: ContactStatus.LOST })

      expect(result.total).toBe(0)
      expect(result.data).toHaveLength(0)
    })
  })

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns a contact when found', async () => {
      qr.query.mockResolvedValueOnce([makeContactRow()])

      const result = await service.findOne(SCHEMA, 'c-1')

      expect(result.id).toBe('c-1')
      expect(result.firstName).toBe('John')
      expect(result.customFields).toEqual({})
    })

    it('throws NotFoundException when contact does not exist', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.findOne(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
    })

    it('throws NotFoundException for soft-deleted contacts', async () => {
      // is_active = false means the WHERE is_active = true query returns nothing
      qr.query.mockResolvedValueOnce([])

      await expect(service.findOne(SCHEMA, 'c-deleted')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('inserts a contact and returns the mapped result', async () => {
      qr.query.mockResolvedValueOnce([makeContactRow()])

      const result = await service.create(
        SCHEMA,
        { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        'user-1',
      )

      expect(result.firstName).toBe('John')
      expect(result.createdById).toBe('user-1')
      const insertQuery: string = qr.query.mock.calls[0][0] as string
      expect(insertQuery).toContain('INSERT INTO contacts')
      expect(insertQuery).toContain('RETURNING')
    })

    it('persists customFields when provided', async () => {
      const customFields = { industry: 'tech', priority: 'high' }
      qr.query.mockResolvedValueOnce([makeContactRow({ custom_fields: customFields })])

      const result = await service.create(SCHEMA, { firstName: 'Jane', customFields }, 'user-1')

      expect(result.customFields).toEqual(customFields)
      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContain(customFields)
    })

    it('defaults customFields to empty object when not provided', async () => {
      qr.query.mockResolvedValueOnce([makeContactRow()])

      await service.create(SCHEMA, { firstName: 'Jane' }, 'user-1')

      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContain({})
    })

    it('throws if INSERT returns no row', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.create(SCHEMA, { firstName: 'Jane' }, 'user-1')).rejects.toThrow(
        'Contact insert returned no row',
      )
    })
  })

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates provided fields and returns updated contact', async () => {
      // assertContactExists + fetchContactOrFail after UPDATE RETURNING
      qr.query
        .mockResolvedValueOnce([{ id: 'c-1' }]) // assertContactExists
        .mockResolvedValueOnce([makeContactRow({ first_name: 'Jane' })]) // UPDATE RETURNING

      const result = await service.update(SCHEMA, 'c-1', { firstName: 'Jane' })

      expect(result.firstName).toBe('Jane')
      const updateQuery: string = qr.query.mock.calls[1][0] as string
      expect(updateQuery).toContain('UPDATE contacts')
      expect(updateQuery).toContain('first_name = $')
    })

    it('returns existing contact when no fields are provided', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: 'c-1' }]) // assertContactExists
        .mockResolvedValueOnce([makeContactRow()]) // fetchContactOrFail (no-op path)

      const result = await service.update(SCHEMA, 'c-1', {})

      expect(result.id).toBe('c-1')
      // Only 2 queries: assert + fetch (no UPDATE)
      expect(qr.query).toHaveBeenCalledTimes(2)
    })

    it('throws NotFoundException when contact does not exist', async () => {
      qr.query.mockResolvedValueOnce([]) // assertContactExists → empty

      await expect(service.update(SCHEMA, 'missing', { firstName: 'X' })).rejects.toThrow(
        NotFoundException,
      )
    })

    it('updates customFields when provided', async () => {
      const customFields = { tier: 'gold' }
      qr.query
        .mockResolvedValueOnce([{ id: 'c-1' }])
        .mockResolvedValueOnce([makeContactRow({ custom_fields: customFields })])

      const result = await service.update(SCHEMA, 'c-1', { customFields })

      expect(result.customFields).toEqual(customFields)
      const updateQuery: string = qr.query.mock.calls[1][0] as string
      expect(updateQuery).toContain('custom_fields = $')
    })
  })

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('soft-deletes the contact by setting is_active = false', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: 'c-1' }]) // assertContactExists
        .mockResolvedValueOnce([]) // UPDATE is_active = false

      await service.remove(SCHEMA, 'c-1')

      const softDeleteQuery: string = qr.query.mock.calls[1][0] as string
      expect(softDeleteQuery).toContain('is_active = false')
    })

    it('throws NotFoundException when contact does not exist', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.remove(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── getTimeline ──────────────────────────────────────────────────────────

  describe('getTimeline', () => {
    it('returns activities and deals in parallel', async () => {
      const activityRow = {
        id: 'a-1',
        activity_type: 'call',
        title: 'Follow-up call',
        description: null,
        due_date: null,
        completed_at: null,
        assigned_to_id: null,
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
      }
      const dealRow = {
        id: 'd-1',
        title: 'Big Deal',
        value_cents: 500000,
        status: 'open',
        stage_id: 'stage-1',
        pipeline_id: 'pipe-1',
        expected_close_date: null,
        created_at: '2024-01-01T00:00:00Z',
      }

      qr.query
        .mockResolvedValueOnce([{ id: 'c-1' }]) // assertContactExists
        .mockResolvedValueOnce([activityRow]) // activities (Promise.all[0])
        .mockResolvedValueOnce([dealRow]) // deals (Promise.all[1])

      const result = await service.getTimeline(SCHEMA, 'c-1')

      expect(result.activities).toHaveLength(1)
      expect(result.activities[0]?.activityType).toBe('call')
      expect(result.deals).toHaveLength(1)
      expect(result.deals[0]?.valueCents).toBe(500000)
    })

    it('throws NotFoundException when contact does not exist', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.getTimeline(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
    })

    it('returns empty arrays when contact has no activity', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: 'c-1' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await service.getTimeline(SCHEMA, 'c-1')

      expect(result.activities).toHaveLength(0)
      expect(result.deals).toHaveLength(0)
    })
  })

  // ─── buildWhereClause (via findAll) ───────────────────────────────────────

  describe('buildWhereClause filters', () => {
    beforeEach(() => {
      qr.query.mockResolvedValue([{ count: '0' }]).mockResolvedValue([])
    })

    it('always includes is_active = true', async () => {
      await service.findAll(SCHEMA, {})
      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('is_active = true')
    })

    it('filters by source', async () => {
      qr.query
        .mockReset()
        .mockResolvedValueOnce([{ count: '0' }])
        .mockResolvedValueOnce([])

      await service.findAll(SCHEMA, { source: ContactSource.WHATSAPP })

      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContain(ContactSource.WHATSAPP)
    })

    it('filters by companyId', async () => {
      qr.query
        .mockReset()
        .mockResolvedValueOnce([{ count: '0' }])
        .mockResolvedValueOnce([])

      await service.findAll(SCHEMA, { companyId: 'company-uuid' })

      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContain('company-uuid')
    })

    it('filters by tags array using @> operator', async () => {
      qr.query
        .mockReset()
        .mockResolvedValueOnce([{ count: '0' }])
        .mockResolvedValueOnce([])

      await service.findAll(SCHEMA, { tags: ['vip', 'hot'] })

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('@>')
      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContain(['vip', 'hot'])
    })
  })
})
