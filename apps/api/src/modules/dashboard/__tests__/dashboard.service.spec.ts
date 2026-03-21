import { Test } from '@nestjs/testing'
import { DashboardService } from '../dashboard.service'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { CacheService } from '@/shared/cache/cache.service'

const SCHEMA = 'tenant_acme'
const TENANT_ID = 'tenant-1'
const USER_ID = 'user-1'

function buildQrMock() {
  return { query: jest.fn() }
}

function buildDbMock(qr: ReturnType<typeof buildQrMock>) {
  return {
    query: jest.fn((_schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
  }
}

describe('DashboardService', () => {
  let service: DashboardService
  let qr: ReturnType<typeof buildQrMock>
  let cacheMock: { get: jest.Mock; set: jest.Mock; del: jest.Mock }

  beforeEach(async () => {
    qr = buildQrMock()
    const db = buildDbMock(qr)
    cacheMock = { get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: TenantDbService, useValue: db },
        { provide: CacheService, useValue: cacheMock },
      ],
    }).compile()

    service = module.get(DashboardService)
  })

  describe('getMetrics', () => {
    it('returns KPI metrics from DB queries', async () => {
      qr.query
        .mockResolvedValueOnce([
          {
            total_receivable_cents: '5000000',
            total_overdue_cents: '1200000',
            invoiced_this_month_cents: '3000000',
            invoiced_this_month_count: '12',
          },
        ])
        .mockResolvedValueOnce([
          {
            active_count: '8',
            active_value: '15000000',
            won_count: '3',
            won_value: '7500000',
          },
        ])
        .mockResolvedValueOnce([{ count: '15' }])
        .mockResolvedValueOnce([{ count: '5' }])

      const result = await service.getMetrics(SCHEMA, TENANT_ID)

      expect(result.totalReceivableCents).toBe(5000000)
      expect(result.totalOverdueCents).toBe(1200000)
      expect(result.activeDealsCount).toBe(8)
      expect(result.wonDealsThisMonthCount).toBe(3)
      expect(result.newContactsThisMonth).toBe(15)
      expect(result.pendingActivitiesCount).toBe(5)
    })

    it('returns cached metrics on second call', async () => {
      const cached = { totalReceivableCents: 100 }
      cacheMock.get.mockResolvedValueOnce(cached)

      const result = await service.getMetrics(SCHEMA, TENANT_ID)

      expect(result).toBe(cached)
      expect(qr.query).not.toHaveBeenCalled()
    })

    it('caches metrics after DB query', async () => {
      qr.query
        .mockResolvedValueOnce([
          {
            total_receivable_cents: '0',
            total_overdue_cents: '0',
            invoiced_this_month_cents: '0',
            invoiced_this_month_count: '0',
          },
        ])
        .mockResolvedValueOnce([
          { active_count: '0', active_value: '0', won_count: '0', won_value: '0' },
        ])
        .mockResolvedValueOnce([{ count: '0' }])
        .mockResolvedValueOnce([{ count: '0' }])

      await service.getMetrics(SCHEMA, TENANT_ID)

      expect(cacheMock.set).toHaveBeenCalledWith(
        `dashboard:metrics:${TENANT_ID}`,
        expect.any(Object),
        300,
      )
    })
  })

  describe('getPipelineSummary', () => {
    it('returns deals grouped by pipeline and stage', async () => {
      qr.query.mockResolvedValueOnce([
        {
          pipeline_id: 'p1',
          pipeline_name: 'Ventas',
          stage_id: 's1',
          stage_name: 'Prospecto',
          stage_color: '#3B82F6',
          stage_position: 0,
          deal_count: '3',
          total_value_cents: '5000000',
        },
        {
          pipeline_id: 'p1',
          pipeline_name: 'Ventas',
          stage_id: 's2',
          stage_name: 'Propuesta',
          stage_color: '#F59E0B',
          stage_position: 1,
          deal_count: '2',
          total_value_cents: '8000000',
        },
      ])

      const result = await service.getPipelineSummary(SCHEMA)

      expect(result).toHaveLength(1)
      expect(result[0]?.pipelineName).toBe('Ventas')
      expect(result[0]?.stages).toHaveLength(2)
      expect(result[0]?.totalDeals).toBe(5)
      expect(result[0]?.totalValueCents).toBe(13000000)
    })
  })

  describe('getTodayActivities', () => {
    it('returns pending activities for today', async () => {
      qr.query.mockResolvedValueOnce([
        {
          id: 'a1',
          activity_type: 'call',
          title: 'Follow up',
          due_date: '2026-03-20T10:00:00Z',
          status: 'pending',
          contact_name: 'Juan',
          deal_title: null,
        },
      ])

      const result = await service.getTodayActivities(SCHEMA, USER_ID)

      expect(result).toHaveLength(1)
      expect(result[0]?.activityType).toBe('call')
    })
  })

  describe('getOverdueInvoices', () => {
    it('returns overdue invoices sorted by oldest', async () => {
      qr.query.mockResolvedValueOnce([
        {
          id: 'i1',
          invoice_number: 'F-001',
          company_name: 'Acme',
          contact_name: null,
          total_cents: '5000000',
          due_date: '2026-03-01',
          days_overdue: '19',
        },
      ])

      const result = await service.getOverdueInvoices(SCHEMA)

      expect(result).toHaveLength(1)
      expect(result[0]?.daysOverdue).toBe(19)
    })
  })

  describe('getTopSalesReps', () => {
    it('returns top performers this month', async () => {
      qr.query.mockResolvedValueOnce([
        {
          user_id: 'u1',
          user_name: 'Carlos López',
          won_deals_count: '5',
          total_value_cents: '25000000',
        },
      ])

      const result = await service.getTopSalesReps(SCHEMA)

      expect(result).toHaveLength(1)
      expect(result[0]?.wonDealsCount).toBe(5)
    })
  })

  describe('getRevenueByMonth', () => {
    it('returns revenue trend for last N months', async () => {
      qr.query.mockResolvedValueOnce([
        { month: '2026-01', invoiced_cents: '10000000', paid_cents: '8000000', deal_count: '5' },
        { month: '2026-02', invoiced_cents: '12000000', paid_cents: '10000000', deal_count: '7' },
        { month: '2026-03', invoiced_cents: '8000000', paid_cents: '3000000', deal_count: '4' },
      ])

      const result = await service.getRevenueByMonth(SCHEMA, 3)

      expect(result).toHaveLength(3)
      expect(result[2]?.month).toBe('2026-03')
    })
  })

  describe('invalidateCache', () => {
    it('deletes cache key', async () => {
      await service.invalidateCache(TENANT_ID)

      expect(cacheMock.del).toHaveBeenCalledWith(`dashboard:metrics:${TENANT_ID}`)
    })
  })
})
