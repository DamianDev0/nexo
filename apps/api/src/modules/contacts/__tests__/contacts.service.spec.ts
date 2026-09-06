import { EventBusService } from '@/shared/events/event-bus.service'
import { ContactDuplicatesService } from '../services/contact-duplicates.service'
import { AUDIT_EVENTS, AuditAction, AuditEntityEvent } from '@/shared/events/audit.events'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ContactsService } from '../services/contacts.service'
import { ContactsRepository } from '../repositories/contacts.repository'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { expectPageAndLimitApplied } from '@/shared/testing/crud-assertions'
import { buildDbMock, buildQrMock } from '@/shared/testing/tenant-db.mock'
import { DOMAIN_EVENTS, LifecycleStage } from '@repo/shared-types'
import type { PaginatedContacts } from '@repo/shared-types'

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
    municipio_code: '11001',
    status: 'new',
    source: 'manual',
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

describe('ContactsService', () => {
  let service: ContactsService
  let db: ReturnType<typeof buildDbMock>
  let qr: ReturnType<typeof buildQrMock>
  let eventBus: { emit: jest.Mock; emitCrm: jest.Mock }
  let duplicates: { assertNoDuplicates: jest.Mock; probe: jest.Mock }

  beforeEach(async () => {
    qr = buildQrMock()
    db = buildDbMock(qr)
    eventBus = { emit: jest.fn(), emitCrm: jest.fn() }
    duplicates = { assertNoDuplicates: jest.fn(), probe: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        ContactsService,
        ContactsRepository,
        { provide: TenantDbService, useValue: db },
        { provide: EventBusService, useValue: eventBus },
        { provide: ContactDuplicatesService, useValue: duplicates },
      ],
    }).compile()

    service = module.get(ContactsService)
  })

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
      await expectPageAndLimitApplied(qr, makeContactRow, (query) => service.findAll(SCHEMA, query))
    })

    it('applies status filter to WHERE clause', async () => {
      qr.query
        .mockResolvedValueOnce([{ count: '1' }])
        .mockResolvedValueOnce([makeContactRow({ status: 'qualified' })])

      await service.findAll(SCHEMA, { status: 'qualified' })

      const countQuery: string = qr.query.mock.calls[0][0] as string
      expect(countQuery).toContain('status = $')
      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContain('qualified')
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

      const result = await service.findAll(SCHEMA, { status: 'lost' })

      expect(result.total).toBe(0)
      expect(result.data).toHaveLength(0)
    })
  })

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
      qr.query.mockResolvedValueOnce([])

      await expect(service.findOne(SCHEMA, 'c-deleted')).rejects.toThrow(NotFoundException)
    })
  })

  describe('probeDuplicates', () => {
    it('delegates to the duplicates service inside a read query and wraps the payload', async () => {
      const payload = { severity: 'hard', field: 'email', matches: [] }
      duplicates.probe.mockResolvedValue(payload)

      const result = await service.probeDuplicates(SCHEMA, {
        email: 'john@example.com',
        excludeId: 'c-1',
      })

      expect(result).toEqual({ duplicate: payload })
      expect(db.query).toHaveBeenCalledWith(SCHEMA, expect.any(Function))
      expect(duplicates.probe).toHaveBeenCalledWith(qr, { email: 'john@example.com' }, 'c-1')
    })

    it('returns a null duplicate when nothing matches', async () => {
      duplicates.probe.mockResolvedValue(null)

      const result = await service.probeDuplicates(SCHEMA, { phone: '3001234567' })

      expect(result).toEqual({ duplicate: null })
      expect(duplicates.probe).toHaveBeenCalledWith(qr, { phone: '3001234567' }, undefined)
    })
  })

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

    it('canonicalizes tags against the enabled catalog before inserting', async () => {
      qr.query
        .mockResolvedValueOnce([{ name: 'VIP' }, { name: 'Mayorista' }])
        .mockResolvedValueOnce([makeContactRow({ tags: ['VIP'] })])

      const result = await service.create(SCHEMA, { firstName: 'Ana', tags: ['vip', 'VIP'] }, 'u-1')

      expect(result.tags).toEqual(['VIP'])
      const catalogQuery: string = qr.query.mock.calls[0][0] as string
      expect(catalogQuery).toContain('FROM tags')
      const insertParams: unknown[] = qr.query.mock.calls[1][1] as unknown[]
      expect(insertParams).toContainEqual(['VIP'])
    })

    it('rejects tags that are not in the catalog', async () => {
      qr.query.mockResolvedValueOnce([{ name: 'VIP' }])

      await expect(
        service.create(SCHEMA, { firstName: 'Ana', tags: ['fantasma'] }, 'u-1'),
      ).rejects.toThrow(BadRequestException)
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
      expect(params).toContainEqual({})
    })

    it('throws if INSERT returns no row', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.create(SCHEMA, { firstName: 'Jane' }, 'user-1')).rejects.toThrow(
        'Contact insert returned no row',
      )
    })

    it('checks for duplicates before inserting, honouring the force flag', async () => {
      qr.query.mockResolvedValueOnce([makeContactRow()])

      await service.create(SCHEMA, { firstName: 'John', email: 'john@example.com' }, 'user-1', true)

      expect(duplicates.assertNoDuplicates).toHaveBeenCalledWith(
        qr,
        { firstName: 'John', email: 'john@example.com' },
        { force: true },
      )
    })

    it('emits a ContactCreated audit event with the created id and actor', async () => {
      qr.query.mockResolvedValueOnce([makeContactRow({ id: 'c-new' })])

      await service.create(SCHEMA, { firstName: 'John' }, 'user-1')

      expect(eventBus.emit).toHaveBeenCalledWith(AUDIT_EVENTS.ENTITY, expect.any(AuditEntityEvent))
      const event = eventBus.emit.mock.calls[0][1] as AuditEntityEvent
      expect(event.action).toBe(AuditAction.ContactCreated)
      expect(event.entityId).toBe('c-new')
      expect(event.userId).toBe('user-1')
      expect(event.schemaName).toBe(SCHEMA)
    })

    it('defaults lifecycleStage to subscriber and never writes columns that left the core', async () => {
      qr.query.mockResolvedValueOnce([makeContactRow()])

      await service.create(SCHEMA, { firstName: 'Jane' }, 'user-1')

      const insertQuery: string = qr.query.mock.calls[0][0] as string
      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params[11]).toBe(LifecycleStage.SUBSCRIBER)
      expect(insertQuery).not.toMatch(/job_title|lead_score|score|type_label|opt_out_|data_consent/)
    })
  })

  describe('update', () => {
    it('updates provided fields and returns updated contact', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: 'c-1' }])
        .mockResolvedValueOnce([makeContactRow({ first_name: 'Jane' })])

      const result = await service.update(SCHEMA, 'c-1', { firstName: 'Jane' })

      expect(result.firstName).toBe('Jane')
      const updateQuery: string = qr.query.mock.calls[1][0] as string
      expect(updateQuery).toContain('UPDATE contacts')
      expect(updateQuery).toContain('first_name = $')
    })

    it('returns existing contact when no fields are provided', async () => {
      qr.query.mockResolvedValueOnce([{ id: 'c-1' }]).mockResolvedValueOnce([makeContactRow()])

      const result = await service.update(SCHEMA, 'c-1', {})

      expect(result.id).toBe('c-1')

      expect(qr.query).toHaveBeenCalledTimes(2)
    })

    it('throws NotFoundException when contact does not exist', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.update(SCHEMA, 'missing', { firstName: 'X' })).rejects.toThrow(
        NotFoundException,
      )
    })

    it('canonicalizes tags against the catalog on update', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: 'c-1' }])
        .mockResolvedValueOnce([{ name: 'VIP' }])
        .mockResolvedValueOnce([makeContactRow({ tags: ['VIP'] })])

      const result = await service.update(SCHEMA, 'c-1', { tags: ['vip'] })

      expect(result.tags).toEqual(['VIP'])
      const updateParams: unknown[] = qr.query.mock.calls[2][1] as unknown[]
      expect(updateParams).toContainEqual(['VIP'])
    })

    it('rejects unknown tags on update', async () => {
      qr.query.mockResolvedValueOnce([{ id: 'c-1' }]).mockResolvedValueOnce([{ name: 'VIP' }])

      await expect(service.update(SCHEMA, 'c-1', { tags: ['fantasma'] })).rejects.toThrow(
        BadRequestException,
      )
    })

    it('records lifecycle history in the same transaction when the stage changes', async () => {
      qr.query
        .mockResolvedValueOnce([makeContactRow({ lifecycle_stage: 'lead' })])
        .mockResolvedValueOnce([makeContactRow({ lifecycle_stage: 'customer' })])
        .mockResolvedValueOnce([])

      await service.update(SCHEMA, 'c-1', { lifecycleStage: 'customer' }, false, undefined, 'u-1')

      const historyCall = qr.query.mock.calls.find(([sql]) =>
        (sql as string).includes('contact_lifecycle_history'),
      )
      expect(historyCall).toBeDefined()
      expect(historyCall![0]).toContain('INSERT INTO contact_lifecycle_history')
      expect(historyCall![1]).toEqual(['c-1', 'lead', 'customer', 'manual', 'u-1'])
      expect(eventBus.emitCrm).toHaveBeenCalledWith(
        DOMAIN_EVENTS.CONTACT_LIFECYCLE_CHANGED,
        expect.objectContaining({ fromStage: 'lead', toStage: 'customer', changedBy: 'u-1' }),
      )
    })

    it('skips lifecycle history when the stage does not change', async () => {
      qr.query
        .mockResolvedValueOnce([makeContactRow({ lifecycle_stage: 'lead' })])
        .mockResolvedValueOnce([makeContactRow({ lifecycle_stage: 'lead' })])

      await service.update(SCHEMA, 'c-1', { lifecycleStage: 'lead' })

      const historyCall = qr.query.mock.calls.find(([sql]) =>
        (sql as string).includes('contact_lifecycle_history'),
      )
      expect(historyCall).toBeUndefined()
      expect(eventBus.emitCrm).not.toHaveBeenCalledWith(
        DOMAIN_EVENTS.CONTACT_LIFECYCLE_CHANGED,
        expect.anything(),
      )
    })

    it('rejects a lifecycle stage outside the tenant catalog', async () => {
      await expect(
        service.update(SCHEMA, 'c-1', { lifecycleStage: 'etapa_fantasma' }),
      ).rejects.toThrow(BadRequestException)
    })

    it('updates customFields when provided', async () => {
      const customFields = { tier: 'gold' }
      qr.query
        .mockResolvedValueOnce([{ id: 'c-1' }])
        .mockResolvedValueOnce([makeContactRow({ custom_fields: customFields })])

      const result = await service.update(SCHEMA, 'c-1', { customFields })

      expect(result.customFields).toEqual(customFields)
      const updateQuery: string = qr.query.mock.calls[1][0] as string
      expect(updateQuery).toContain(
        "custom_fields = jsonb_strip_nulls(COALESCE(custom_fields, '{}'::jsonb) || $1::jsonb)",
      )
    })

    it('checks for duplicates excluding itself, honouring the force flag', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: 'c-1' }])
        .mockResolvedValueOnce([makeContactRow({ email: 'new@example.com' })])

      await service.update(SCHEMA, 'c-1', { email: 'new@example.com' }, true)

      expect(duplicates.assertNoDuplicates).toHaveBeenCalledWith(
        qr,
        { email: 'new@example.com' },
        { force: true, excludeId: 'c-1' },
      )
    })

    it('emits a ContactUpdated audit event for the updated contact', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: 'c-1' }])
        .mockResolvedValueOnce([makeContactRow({ first_name: 'Jane' })])

      await service.update(SCHEMA, 'c-1', { firstName: 'Jane' })

      const event = eventBus.emit.mock.calls[0][1] as AuditEntityEvent
      expect(event.action).toBe(AuditAction.ContactUpdated)
      expect(event.entityId).toBe('c-1')
    })
  })

  describe('remove', () => {
    it('soft-deletes the contact by setting is_active = false', async () => {
      qr.query.mockResolvedValueOnce([{ id: 'c-1' }]).mockResolvedValueOnce([])

      await service.remove(SCHEMA, 'c-1')

      const softDeleteQuery: string = qr.query.mock.calls[1][0] as string
      expect(softDeleteQuery).toContain('is_active = false')
    })

    it('throws NotFoundException when contact does not exist', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.remove(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
    })
  })

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
        .mockResolvedValueOnce([{ id: 'c-1' }])
        .mockResolvedValueOnce([activityRow])
        .mockResolvedValueOnce([dealRow])

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

  describe('buildWhereClause filters', () => {
    beforeEach(() => {
      qr.query
        .mockReset()
        .mockResolvedValueOnce([{ count: '0' }])
        .mockResolvedValueOnce([])
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

      await service.findAll(SCHEMA, { source: 'whatsapp' })

      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(params).toContain('whatsapp')
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
      expect(params).toContainEqual(['vip', 'hot'])
    })
  })
})
