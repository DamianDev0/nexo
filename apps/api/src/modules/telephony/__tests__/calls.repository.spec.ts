import { Test } from '@nestjs/testing'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { buildDbMock, buildQrMock } from '@/shared/testing/tenant-db.mock'
import { CallsRepository } from '../repositories/calls.repository'
import { TERMINAL_CALL_STATUSES } from '../constants/call.constants'

const SCHEMA = 'tenant_acme'

describe('CallsRepository', () => {
  let repository: CallsRepository
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(async () => {
    qr = buildQrMock()
    const module = await Test.createTestingModule({
      providers: [CallsRepository, { provide: TenantDbService, useValue: buildDbMock(qr) }],
    }).compile()
    repository = module.get(CallsRepository)
  })

  it('inserts an outbound call idempotently on the provider sid', async () => {
    qr.query.mockResolvedValueOnce([{ id: 'call-1' }])
    await repository.insertOutbound(SCHEMA, {
      providerCallSid: 'CA1',
      fromNumber: '+1',
      toNumber: '+57',
      contactId: null,
      userId: 'usr-1',
    })
    const [sql, params] = qr.query.mock.calls[0] as [string, unknown[]]
    expect(sql).toContain('ON CONFLICT (provider, provider_call_sid)')
    expect(params).toEqual(['CA1', '+1', '+57', null, 'usr-1'])
  })

  it('guards progress updates against terminal states and stale sequences', async () => {
    qr.query.mockResolvedValueOnce([])
    await repository.applyProgress(SCHEMA, {
      providerCallSid: 'CA1',
      status: 'ringing',
      sequence: 4,
    })
    const [sql, params] = qr.query.mock.calls[0] as [string, unknown[]]
    expect(sql).toContain('ended_at IS NULL')
    expect(sql).toContain('last_sequence < $3')
    expect(params).toEqual(['CA1', 'ringing', 4, TERMINAL_CALL_STATUSES])
  })

  it('finalizes only once and returns null on repeat', async () => {
    qr.query.mockResolvedValueOnce([])
    const result = await repository.finalize(SCHEMA, {
      providerCallSid: 'CA1',
      status: 'completed',
      durationSeconds: 10,
    })
    expect(result).toBeNull()
    const [sql] = qr.query.mock.calls[0] as [string]
    expect(sql).toContain('WHERE provider_call_sid = $1 AND ended_at IS NULL')
  })

  it('builds the recent-calls filter with positional params', async () => {
    qr.query.mockResolvedValueOnce([])
    await repository.findRecent(SCHEMA, { contactId: 'cnt-1', limit: 5 })
    const [sql, params] = qr.query.mock.calls[0] as [string, unknown[]]
    expect(sql).toContain('WHERE contact_id = $2')
    expect(sql).toContain('LIMIT $1')
    expect(params).toEqual([5, 'cnt-1'])
  })
})
