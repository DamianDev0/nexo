import { Test } from '@nestjs/testing'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { EventBusService } from '@/shared/events/event-bus.service'
import { buildDbMock, buildQrMock } from '@/shared/testing/tenant-db.mock'
import { ContactDuplicatesService } from '../services/contact-duplicates.service'
import { ContactsService } from '../services/contacts.service'
import { ContactsRepository } from '../repositories/contacts.repository'
import type { ContactListQuery } from '../interfaces/contact-row.interfaces'

const SCHEMA = 'tenant_test'

describe('ContactsService query extensions', () => {
  let service: ContactsService
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(async () => {
    qr = buildQrMock()
    const module = await Test.createTestingModule({
      providers: [
        ContactsService,
        ContactsRepository,
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
      sortBy: 'email',
      sortDir: 'asc',
    } as ContactListQuery)

    const [dataSql] = qr.query.mock.calls[1] as [string]
    expect(dataSql).toContain('ORDER BY email ASC NULLS LAST, id ASC')
  })

  it('falls back to created_at DESC when no sort is provided', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await service.findAll(SCHEMA, {} as ContactListQuery)

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
    } as ContactListQuery)

    const [countSql, params] = qr.query.mock.calls[0] as [string, unknown[]]
    expect(countSql).toContain('lifecycle_stage = $1')
    expect(countSql).toContain('LOWER(city) = LOWER($2)')
    expect(countSql).toContain('created_at >= $3')
    expect(countSql).toContain('last_contacted_at <= $4')
    expect(params).toEqual(['customer', 'Bogota', '2026-01-01T00:00:00Z', '2026-07-01T00:00:00Z'])
  })

  it('aggregates active counts by status and archived separately', async () => {
    qr.query
      .mockResolvedValueOnce([
        { status: 'new', count: '4' },
        { status: 'client', count: '2' },
      ])
      .mockResolvedValueOnce([{ count: '3' }])
      .mockResolvedValueOnce([{ mine: '2', unassigned: '1', unassigned_recent: '1' }])

    const counts = await service.counts(SCHEMA, 'u-1')

    expect(qr.query).toHaveBeenCalledTimes(3)
    expect(counts).toEqual({
      total: 6,
      archived: 3,
      mine: 2,
      unassigned: 1,
      unassignedRecent: 1,
      byStatus: { new: 4, client: 2 },
    })
  })

  it('lists archived contacts when the archived flag is set', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await service.findAll(SCHEMA, { archived: true } as ContactListQuery)

    const [countSql] = qr.query.mock.calls[0] as [string]
    expect(countSql).toContain('is_active = false')
    expect(countSql).not.toContain('is_active = true')
  })
})
