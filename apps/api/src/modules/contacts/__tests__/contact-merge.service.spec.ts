import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { DOMAIN_EVENTS } from '@repo/shared-types'
import { EventBusService } from '@/shared/events/event-bus.service'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { buildDbMock, buildQrMock } from '@/shared/testing/tenant-db.mock'
import { ContactMergeService } from '../services/contact-merge.service'
import { ContactsRepository } from '../repositories/contacts.repository'
import { ContactStatsCacheService } from '../services/contact-stats-cache.service'
import { MERGE_CHILD_TABLES } from '../constants/contact.constants'

const SCHEMA = 'tenant_acme'
const WINNER = 'c-winner'
const LOSER = 'c-loser'

function contactRow(overrides: Record<string, unknown> = {}) {
  return {
    id: WINNER,
    first_name: 'Carolina',
    last_name: 'Rodríguez',
    email: 'carolina@acme.co',
    phone: '3001234567',
    whatsapp: null,
    document_type: 'cc',
    document_number: '123456789',
    avatar_url: null,
    city: 'Bogotá',
    municipio_code: '11001',
    status: 'new',
    status_changed_at: null,
    lifecycle_stage: 'lead',
    source: 'manual',
    last_contacted_at: null,
    tags: ['vip'],
    company_id: null,
    assigned_to_id: null,
    custom_fields: {},
    is_active: true,
    created_by: 'user-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('ContactMergeService', () => {
  let service: ContactMergeService
  let db: ReturnType<typeof buildDbMock>
  let qr: ReturnType<typeof buildQrMock>
  let eventBus: { emit: jest.Mock; emitCrm: jest.Mock }
  let stats: { invalidate: jest.Mock }

  beforeEach(async () => {
    qr = buildQrMock()
    db = buildDbMock(qr)
    eventBus = { emit: jest.fn(), emitCrm: jest.fn() }
    stats = { invalidate: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        ContactMergeService,
        ContactsRepository,
        { provide: TenantDbService, useValue: db },
        { provide: EventBusService, useValue: eventBus },
        { provide: ContactStatsCacheService, useValue: stats },
      ],
    }).compile()

    service = module.get(ContactMergeService)
  })

  function mockHappyPath() {
    qr.query
      .mockResolvedValueOnce([contactRow(), contactRow({ id: LOSER, tags: ['cliente'] })])
      .mockResolvedValueOnce([{ id: 'a-1' }, { id: 'a-2' }])
      .mockResolvedValueOnce([{ id: 'd-1' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'dc-1' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([contactRow({ tags: ['vip', 'cliente'] })])
  }

  it('locks both contacts in id order before touching anything', async () => {
    mockHappyPath()

    await service.merge(SCHEMA, WINNER, { loserId: LOSER })

    const [lockSql, lockParams] = qr.query.mock.calls[0] as [string, unknown[]]
    expect(lockSql).toContain('ORDER BY id')
    expect(lockSql).toContain('FOR UPDATE')
    expect(lockParams).toEqual([[WINNER, LOSER]])
  })

  it('archives the loser before copying its fields so unique indexes never collide', async () => {
    mockHappyPath()

    await service.merge(SCHEMA, WINNER, { loserId: LOSER, fieldsFromLoser: ['email'] })

    const statements = qr.query.mock.calls.map(([sql]) => String(sql))
    const archiveAt = statements.findIndex((sql) => sql.includes('merged_into_id = $2'))
    const copyAt = statements.findIndex((sql) => sql.includes('UPDATE contacts AS winner'))
    expect(archiveAt).toBeLessThan(copyAt)
  })

  it('answers 409 when the loser was already merged by a concurrent request', async () => {
    qr.query.mockResolvedValueOnce([contactRow(), contactRow({ id: LOSER, is_active: false })])

    await expect(service.merge(SCHEMA, WINNER, { loserId: LOSER })).rejects.toThrow(
      ConflictException,
    )
  })

  it('refuses to merge a contact into itself', async () => {
    await expect(service.merge(SCHEMA, WINNER, { loserId: WINNER })).rejects.toThrow(
      BadRequestException,
    )
    expect(db.transactional).not.toHaveBeenCalled()
  })

  it('runs the whole merge inside one transaction', async () => {
    mockHappyPath()

    await service.merge(SCHEMA, WINNER, { loserId: LOSER })

    expect(db.transactional).toHaveBeenCalledTimes(1)
    expect(db.query).not.toHaveBeenCalled()
  })

  it('reassigns every table that points at a contact', async () => {
    mockHappyPath()

    await service.merge(SCHEMA, WINNER, { loserId: LOSER })

    const statements = qr.query.mock.calls.map(([sql]) => String(sql))
    for (const table of MERGE_CHILD_TABLES) {
      expect(statements.some((sql) => sql.includes(`UPDATE ${table} SET contact_id`))).toBe(true)
    }
  })

  it('reports what it moved and returns the surviving contact', async () => {
    mockHappyPath()

    const result = await service.merge(SCHEMA, WINNER, { loserId: LOSER })

    expect(result.movedActivities).toBe(2)
    expect(result.movedDeals).toBe(1)
    expect(result.movedRecords).toBe(3)
    expect(result.movedConsents).toBe(1)
    expect(result.contact.id).toBe(WINNER)
    expect(result.contact.tags).toEqual(['vip', 'cliente'])
  })

  it('archives the loser with a pointer to the winner', async () => {
    mockHappyPath()

    await service.merge(SCHEMA, WINNER, { loserId: LOSER })

    const archive = qr.query.mock.calls.find(([sql]) => String(sql).includes('merged_into_id = $2'))
    expect(archive).toBeDefined()
    expect(archive?.[1]).toEqual([LOSER, WINNER])
  })

  it('only keeps the loser consents for channels the winner lacks', async () => {
    mockHappyPath()

    await service.merge(SCHEMA, WINNER, { loserId: LOSER })

    const statements = qr.query.mock.calls.map(([sql]) => String(sql))
    expect(statements.some((sql) => sql.includes('NOT EXISTS'))).toBe(true)
    expect(statements.some((sql) => sql.includes('DELETE FROM data_consents'))).toBe(true)
  })

  it('takes only the fields the caller asked for from the loser', async () => {
    mockHappyPath()

    await service.merge(SCHEMA, WINNER, {
      loserId: LOSER,
      fieldsFromLoser: ['email', 'phone'],
    })

    const update = qr.query.mock.calls.find(([sql]) =>
      String(sql).includes('UPDATE contacts AS winner'),
    )
    expect(String(update?.[0])).toContain('email = loser.email')
    expect(String(update?.[0])).toContain('phone = loser.phone')
    expect(String(update?.[0])).not.toContain('first_name = loser.first_name')
  })

  it('announces the merge only after the transaction closed', async () => {
    mockHappyPath()

    await service.merge(SCHEMA, WINNER, { loserId: LOSER })

    expect(eventBus.emitCrm).toHaveBeenCalledWith(
      DOMAIN_EVENTS.CONTACT_MERGED,
      expect.objectContaining({ schemaName: SCHEMA, entityId: WINNER }),
    )
  })

  it('invalidates the stats cache once after the transaction closes', async () => {
    mockHappyPath()
    const order: string[] = []
    db.transactional.mockImplementationOnce(async (_schema: unknown, cb: unknown) => {
      const result = await (cb as (runner: unknown) => Promise<unknown>)(qr)
      order.push('transactional')
      return result
    })
    stats.invalidate.mockImplementationOnce(async () => {
      order.push('invalidate')
    })

    await service.merge(SCHEMA, WINNER, { loserId: LOSER })

    expect(stats.invalidate).toHaveBeenCalledTimes(1)
    expect(stats.invalidate).toHaveBeenCalledWith(SCHEMA)
    expect(order).toEqual(['transactional', 'invalidate'])
  })

  it('stops when either contact is gone', async () => {
    qr.query.mockResolvedValueOnce([])

    await expect(service.merge(SCHEMA, WINNER, { loserId: LOSER })).rejects.toThrow(
      NotFoundException,
    )

    qr.query.mockReset()
    qr.query.mockResolvedValueOnce([contactRow()])

    await expect(service.merge(SCHEMA, WINNER, { loserId: LOSER })).rejects.toThrow(
      NotFoundException,
    )
  })
})
