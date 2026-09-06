import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { EventBusService } from '@/shared/events/event-bus.service'
import { AUDIT_EVENTS, AuditAction, type AuditEntityEvent } from '@/shared/events/audit.events'
import { buildDbMock, buildQrMock } from '@/shared/testing/tenant-db.mock'
import { ContactConsentsService } from '../services/contact-consents.service'
import { ContactConsentsRepository } from '../repositories/contact-consents.repository'
import { ContactsRepository } from '../repositories/contacts.repository'

const SCHEMA = 'tenant_acme'

function consentRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'dc-1',
    contact_id: 'c-1',
    channel: 'whatsapp',
    granted: false,
    granted_at: null,
    revoked_at: '2026-09-05T00:00:00Z',
    source: 'call',
    reason: 'asked to stop',
    evidence: null,
    updated_at: '2026-09-05T00:00:00Z',
    ...overrides,
  }
}

describe('ContactConsentsService', () => {
  let service: ContactConsentsService
  let qr: ReturnType<typeof buildQrMock>
  let eventBus: { emit: jest.Mock }

  beforeEach(async () => {
    qr = buildQrMock()
    eventBus = { emit: jest.fn() }
    const module = await Test.createTestingModule({
      providers: [
        ContactConsentsService,
        ContactConsentsRepository,
        ContactsRepository,
        { provide: TenantDbService, useValue: buildDbMock(qr) },
        { provide: EventBusService, useValue: eventBus },
      ],
    }).compile()
    service = module.get(ContactConsentsService)
  })

  it('lists consents for an active contact', async () => {
    qr.query.mockResolvedValueOnce([{ id: 'c-1' }]).mockResolvedValueOnce([consentRow()])

    const result = await service.list(SCHEMA, 'c-1')

    expect(result).toEqual([
      expect.objectContaining({ contactId: 'c-1', channel: 'whatsapp', granted: false }),
    ])
  })

  it('upserts one channel with evidence, stamps the actor and audits it', async () => {
    qr.query
      .mockResolvedValueOnce([{ id: 'c-1' }])
      .mockResolvedValueOnce([consentRow({ granted: true, revoked_at: null })])

    const result = await service.upsert(
      SCHEMA,
      'c-1',
      { channel: 'whatsapp', granted: true, source: 'form', evidence: { ip: '1.1.1.1' } },
      'user-1',
    )

    const [sql, params] = qr.query.mock.calls[1] as [string, unknown[]]
    expect(sql).toContain('ON CONFLICT (contact_id, channel)')
    expect(params).toEqual(['c-1', 'whatsapp', true, 'form', null, { ip: '1.1.1.1' }, 'user-1'])
    expect(result.granted).toBe(true)
    const event = eventBus.emit.mock.calls[0] as [string, AuditEntityEvent]
    expect(event[0]).toBe(AUDIT_EVENTS.ENTITY)
    expect(event[1].action).toBe(AuditAction.ContactUpdated)
    expect(event[1].description).toContain('granted')
  })

  it('returns 404 for contacts that are archived or belong elsewhere', async () => {
    qr.query.mockResolvedValue([])

    await expect(service.list(SCHEMA, 'c-x')).rejects.toThrow(NotFoundException)
    await expect(
      service.upsert(SCHEMA, 'c-x', { channel: 'email', granted: false }, 'user-1'),
    ).rejects.toThrow(NotFoundException)
  })
})
