import { Test } from '@nestjs/testing'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { buildDbMock, buildQrMock } from '@/shared/testing/tenant-db.mock'
import { MESSAGE_STATUS_RANK_SQL } from '../constants/message.constants'
import { MessagesRepository } from '../repositories/messages.repository'

const SCHEMA = 'tenant_acme'

describe('MessagesRepository', () => {
  let repository: MessagesRepository
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(async () => {
    qr = buildQrMock()
    const module = await Test.createTestingModule({
      providers: [MessagesRepository, { provide: TenantDbService, useValue: buildDbMock(qr) }],
    }).compile()
    repository = module.get(MessagesRepository)
  })

  it('inserts an outbound queued sms', async () => {
    qr.query.mockResolvedValueOnce([{ id: 'msg-1' }])
    await repository.insertQueued(SCHEMA, {
      fromNumber: '+1',
      toNumber: '+57',
      body: 'Hola',
      contactId: null,
      userId: 'usr-1',
    })
    const [sql, params] = qr.query.mock.calls[0] as [string, unknown[]]
    expect(sql).toContain("VALUES ('sms', 'outbound', 'queued', 'twilio'")
    expect(params).toEqual(['+1', '+57', 'Hola', null, 'usr-1'])
  })

  it('marks sent only once and returns null on repeat', async () => {
    qr.query.mockResolvedValueOnce([])
    const result = await repository.markSent(SCHEMA, {
      messageId: 'msg-1',
      providerMessageSid: 'SM1',
      segments: 2,
    })
    expect(result).toBeNull()
    const [sql, params] = qr.query.mock.calls[0] as [string, unknown[]]
    expect(sql).toContain('WHERE id = $1 AND sent_at IS NULL')
    expect(params).toEqual(['msg-1', 'SM1', 2])
  })

  it('never downgrades a provider status', async () => {
    qr.query.mockResolvedValueOnce([])
    await repository.applyProviderStatus(SCHEMA, {
      providerMessageSid: 'SM1',
      status: 'delivered',
      errorCode: null,
    })
    const [sql, params] = qr.query.mock.calls[0] as [string, unknown[]]
    expect(sql).toContain(`(${MESSAGE_STATUS_RANK_SQL}) < $4::int`)
    expect(params).toEqual(['SM1', 'delivered', null, 2])
  })

  it('filters recent messages by contact with positional params', async () => {
    qr.query.mockResolvedValueOnce([])
    await repository.findRecent(SCHEMA, { contactId: 'cnt-1', limit: 5 })
    const [sql, params] = qr.query.mock.calls[0] as [string, unknown[]]
    expect(sql).toContain('WHERE contact_id = $2')
    expect(params).toEqual([5, 'cnt-1'])
  })
})
