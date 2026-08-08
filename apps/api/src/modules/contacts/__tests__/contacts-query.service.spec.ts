import { Test } from '@nestjs/testing'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { EventBusService } from '@/shared/events/event-bus.service'
import { ContactDuplicatesService } from '../services/contact-duplicates.service'
import { ContactsService } from '../services/contacts.service'
import type { ContactQueryDto } from '../dto/contact.dto'

const SCHEMA = 'tenant_test'

function buildQrMock() {
  return { query: jest.fn() }
}

function buildDbMock(qr: ReturnType<typeof buildQrMock>) {
  return {
    query: jest.fn((schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
    transactional: jest.fn((schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
  }
}

describe('ContactsService query extensions', () => {
  let service: ContactsService
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(async () => {
    qr = buildQrMock()
    const module = await Test.createTestingModule({
      providers: [
        ContactsService,
        { provide: TenantDbService, useValue: buildDbMock(qr) },
        { provide: EventBusService, useValue: { emit: jest.fn() } },
        { provide: ContactDuplicatesService, useValue: { assertNoDuplicates: jest.fn() } },
      ],
    }).compile()
    service = module.get(ContactsService)
  })

  it('maps whitelisted sort fields to columns and keeps a stable tiebreaker', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await service.findAll(SCHEMA, {
      sortBy: 'leadScore',
      sortDir: 'asc',
    } as ContactQueryDto)

    const [dataSql] = qr.query.mock.calls[1] as [string]
    expect(dataSql).toContain('ORDER BY lead_score ASC NULLS LAST, id ASC')
  })

  it('falls back to created_at DESC when no sort is provided', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await service.findAll(SCHEMA, {} as ContactQueryDto)

    const [dataSql] = qr.query.mock.calls[1] as [string]
    expect(dataSql).toContain('ORDER BY created_at DESC NULLS LAST, id ASC')
  })

  it('filters by lifecycle stage, city and date ranges with bound params', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await service.findAll(SCHEMA, {
      lifecycleStage: 'customer',
      city: 'Bogota',
      createdFrom: '2026-01-01T00:00:00Z',
      lastContactedTo: '2026-07-01T00:00:00Z',
    } as ContactQueryDto)

    const [countSql, params] = qr.query.mock.calls[0] as [string, unknown[]]
    expect(countSql).toContain('lifecycle_stage = $1')
    expect(countSql).toContain('LOWER(city) = LOWER($2)')
    expect(countSql).toContain('created_at >= $3')
    expect(countSql).toContain('last_contacted_at <= $4')
    expect(params).toEqual(['customer', 'Bogota', '2026-01-01T00:00:00Z', '2026-07-01T00:00:00Z'])
  })

  it('aggregates counts grouped by status in a single query', async () => {
    qr.query.mockResolvedValueOnce([
      { status: 'new', count: '4' },
      { status: 'client', count: '2' },
    ])

    const counts = await service.counts(SCHEMA)

    expect(qr.query).toHaveBeenCalledTimes(1)
    expect(counts).toEqual({ total: 6, byStatus: { new: 4, client: 2 } })
  })
})
