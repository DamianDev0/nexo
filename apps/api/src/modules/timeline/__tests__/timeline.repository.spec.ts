import { Test } from '@nestjs/testing'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { buildDbMock, buildQrMock } from '@/shared/testing/tenant-db.mock'
import { TimelineRepository } from '../repositories/timeline.repository'

const SCHEMA = 'tenant_acme'
const FILTER_ID = 'entity-1'

describe('TimelineRepository', () => {
  let repository: TimelineRepository
  let qr: ReturnType<typeof buildQrMock>
  let db: ReturnType<typeof buildDbMock>

  beforeEach(async () => {
    qr = buildQrMock()
    db = buildDbMock(qr)

    const module = await Test.createTestingModule({
      providers: [TimelineRepository, { provide: TenantDbService, useValue: db }],
    }).compile()

    repository = module.get(TimelineRepository)
  })

  it('resolves the query against the tenant schema', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await repository.findTimelinePage(SCHEMA, 'contact_id', FILTER_ID, 25, 0)

    expect(db.query).toHaveBeenCalledWith(SCHEMA, expect.any(Function))
  })

  it('runs a count query followed by a data query', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await repository.findTimelinePage(SCHEMA, 'contact_id', FILTER_ID, 25, 0)

    expect(qr.query).toHaveBeenCalledTimes(2)
    const [countSql] = qr.query.mock.calls[0] as [string]
    expect(countSql).toContain('COUNT(*)')
  })

  it('unions activities, deals and notifications', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await repository.findTimelinePage(SCHEMA, 'contact_id', FILTER_ID, 25, 0)

    const [countSql] = qr.query.mock.calls[0] as [string]
    expect(countSql).toContain('FROM activities a')
    expect(countSql).toContain('FROM deals d')
    expect(countSql).toContain('FROM notifications n')
    expect(countSql).toContain('UNION ALL')
  })

  it('filters activities by the given column and excludes inactive rows', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await repository.findTimelinePage(SCHEMA, 'contact_id', FILTER_ID, 25, 0)

    const [countSql] = qr.query.mock.calls[0] as [string]
    expect(countSql).toContain('a.contact_id = $1 AND a.is_active = true')
  })

  it('filters deals by the equivalent column for contact and company scopes', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await repository.findTimelinePage(SCHEMA, 'company_id', FILTER_ID, 25, 0)

    const [countSql] = qr.query.mock.calls[0] as [string]
    expect(countSql).toContain('d.company_id = $1 AND d.is_active = true')
  })

  it('filters deals by their own id when scoping to a deal timeline', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await repository.findTimelinePage(SCHEMA, 'deal_id', FILTER_ID, 25, 0)

    const [countSql] = qr.query.mock.calls[0] as [string]
    expect(countSql).toContain('d.id = $1 AND d.is_active = true')
    expect(countSql).not.toContain('d.deal_id')
  })

  it('filters notifications only by entity_id, with no entity_type discriminator', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await repository.findTimelinePage(SCHEMA, 'contact_id', FILTER_ID, 25, 0)

    const [countSql] = qr.query.mock.calls[0] as [string]
    expect(countSql).toContain('FROM notifications n')
    expect(countSql).toContain('WHERE n.entity_id = $1')
    expect(countSql).not.toContain('n.entity_type =')
  })

  it('binds filterId as the only parameter for the count query', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await repository.findTimelinePage(SCHEMA, 'contact_id', FILTER_ID, 25, 0)

    const [, countParams] = qr.query.mock.calls[0] as [string, unknown[]]
    expect(countParams).toEqual([FILTER_ID])
  })

  it('binds filterId, limit and offset for the data query in order', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await repository.findTimelinePage(SCHEMA, 'contact_id', FILTER_ID, 10, 20)

    const [dataSql, dataParams] = qr.query.mock.calls[1] as [string, unknown[]]
    expect(dataSql).toContain('LIMIT $2 OFFSET $3')
    expect(dataParams).toEqual([FILTER_ID, 10, 20])
  })

  it('orders the merged rows by created_at descending', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    await repository.findTimelinePage(SCHEMA, 'contact_id', FILTER_ID, 25, 0)

    const [dataSql] = qr.query.mock.calls[1] as [string]
    expect(dataSql).toContain('ORDER BY created_at DESC')
  })

  it('returns the parsed total and the rows from the data query', async () => {
    const rows = [
      { id: 'a-1', event_type: 'activity', title: 'Called', created_at: '2026-08-01T00:00:00Z' },
    ]
    qr.query.mockResolvedValueOnce([{ count: '7' }]).mockResolvedValueOnce(rows)

    const result = await repository.findTimelinePage(SCHEMA, 'contact_id', FILTER_ID, 25, 0)

    expect(result).toEqual({ rows, total: 7 })
  })

  it('returns an empty page when there are no matching rows', async () => {
    qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

    const result = await repository.findTimelinePage(SCHEMA, 'contact_id', FILTER_ID, 25, 0)

    expect(result).toEqual({ rows: [], total: 0 })
  })
})
