import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { DealsService } from '../deals.service'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { DealStatus } from '@repo/shared-types'
import type { DealDetail, PaginatedDeals } from '@repo/shared-types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SCHEMA = 'tenant_acme'
const DEAL_ID = 'deal-1'
const USER_ID = 'user-1'
const PIPELINE_ID = 'pipe-1'
const STAGE_ID = 'stage-1'
const CONTACT_ID = 'cnt-1'
const COMPANY_ID = 'co-1'
const ITEM_ID = 'item-1'

function makeDealListRow(overrides: Record<string, unknown> = {}) {
  return {
    id: DEAL_ID,
    title: 'Big Deal',
    value_cents: '5000000',
    expected_close_date: '2026-06-30',
    stage_id: STAGE_ID,
    stage_name: 'Propuesta',
    stage_color: '#F59E0B',
    stage_probability: 50,
    stage_position: 2,
    pipeline_id: PIPELINE_ID,
    pipeline_name: 'Ventas',
    contact_id: CONTACT_ID,
    company_id: COMPANY_ID,
    assigned_to_id: USER_ID,
    loss_reason: null,
    status: 'open',
    is_active: true,
    created_by: USER_ID,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeDealDetailRow(overrides: Record<string, unknown> = {}) {
  return {
    ...makeDealListRow(),
    custom_fields: {},
    contact_first_name: 'Juan',
    contact_last_name: 'Pérez',
    contact_email: 'juan@test.co',
    contact_phone: '3001234567',
    company_name: 'Acme Corp',
    company_nit: '900123456',
    ...overrides,
  }
}

function makeItemRow(overrides: Record<string, unknown> = {}) {
  return {
    id: ITEM_ID,
    deal_id: DEAL_ID,
    product_id: null,
    description: 'Consulting service',
    quantity: 2,
    unit_price_cents: '50000',
    discount_percent: 10,
    iva_rate: 19,
    position: 0,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

// ─── Mock setup ───────────────────────────────────────────────────────────────

function buildQrMock() {
  return { query: jest.fn() }
}

function buildDbMock(qr: ReturnType<typeof buildQrMock>) {
  return {
    query: jest.fn((_schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
    transactional: jest.fn((_schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
  }
}

/** fetchDealOrFail does 2 queries: SELECT detail + SELECT items */
function mockFetchDeal(
  qr: ReturnType<typeof buildQrMock>,
  detailOverrides = {},
  items: unknown[] = [],
) {
  qr.query.mockResolvedValueOnce([makeDealDetailRow(detailOverrides)]).mockResolvedValueOnce(items)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DealsService', () => {
  let service: DealsService
  let db: ReturnType<typeof buildDbMock>
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(async () => {
    qr = buildQrMock()
    db = buildDbMock(qr)

    const module = await Test.createTestingModule({
      providers: [DealsService, { provide: TenantDbService, useValue: db }],
    }).compile()

    service = module.get(DealsService)
  })

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns paginated deals', async () => {
      qr.query
        .mockResolvedValueOnce([{ count: '2' }])
        .mockResolvedValueOnce([makeDealListRow(), makeDealListRow({ id: 'deal-2' })])

      const result: PaginatedDeals = await service.findAll(SCHEMA, {})

      expect(result.total).toBe(2)
      expect(result.data).toHaveLength(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(25)
    })

    it('maps value_cents from string to number', async () => {
      qr.query
        .mockResolvedValueOnce([{ count: '1' }])
        .mockResolvedValueOnce([makeDealListRow({ value_cents: '1500000' })])

      const result = await service.findAll(SCHEMA, {})

      expect(result.data[0]?.valueCents).toBe(1500000)
    })

    it('applies status filter', async () => {
      qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

      await service.findAll(SCHEMA, { status: DealStatus.WON })

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('d.status = $')
    })

    it('applies text search filter (ILIKE)', async () => {
      qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

      await service.findAll(SCHEMA, { q: 'big deal' })

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('ILIKE')
    })

    it('always filters by is_active = true', async () => {
      qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

      await service.findAll(SCHEMA, {})

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('d.is_active = true')
    })
  })

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns deal detail with joined relations and items', async () => {
      mockFetchDeal(qr, {}, [makeItemRow()])

      const result: DealDetail = await service.findOne(SCHEMA, DEAL_ID)

      expect(result.id).toBe(DEAL_ID)
      expect(result.contact?.firstName).toBe('Juan')
      expect(result.company?.name).toBe('Acme Corp')
      expect(result.stage?.name).toBe('Propuesta')
      expect(result.items).toHaveLength(1)
      expect(result.items[0]?.description).toBe('Consulting service')
    })

    it('throws NotFoundException for missing deal', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.findOne(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('inserts a deal with stage history and returns detail', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: STAGE_ID }]) // assertStageInPipeline
        .mockResolvedValueOnce([{ id: DEAL_ID }]) // INSERT RETURNING id
        .mockResolvedValueOnce([]) // recordStageChange
      mockFetchDeal(qr) // fetchDealOrFail (detail + items)

      const result = await service.create(
        SCHEMA,
        { title: 'Big Deal', stageId: STAGE_ID, pipelineId: PIPELINE_ID },
        USER_ID,
      )

      expect(result.title).toBe('Big Deal')
      // Verify stage history was recorded
      const historyCall = qr.query.mock.calls[2]
      const historySql: string = historyCall[0] as string
      expect(historySql).toContain('deal_stage_history')
    })

    it('skips stage validation when no stageId/pipelineId', async () => {
      qr.query.mockResolvedValueOnce([{ id: DEAL_ID }]) // INSERT
      mockFetchDeal(qr, { stage_id: null, pipeline_id: null })

      await service.create(SCHEMA, { title: 'No Stage Deal' }, USER_ID)

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('INSERT INTO deals')
    })
  })

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates deal fields and returns detail', async () => {
      qr.query.mockResolvedValueOnce([{ id: DEAL_ID }]) // assertDealExists
      qr.query.mockResolvedValueOnce([]) // UPDATE
      mockFetchDeal(qr, { title: 'Updated' }) // fetchDealOrFail

      const result = await service.update(SCHEMA, DEAL_ID, { title: 'Updated' })

      expect(result.title).toBe('Updated')
    })

    it('returns current state when no fields provided', async () => {
      qr.query.mockResolvedValueOnce([{ id: DEAL_ID }]) // assertDealExists
      mockFetchDeal(qr) // fetchDealOrFail

      const result = await service.update(SCHEMA, DEAL_ID, {})

      expect(result.id).toBe(DEAL_ID)
    })

    it('throws NotFoundException when deal does not exist', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.update(SCHEMA, 'missing', { title: 'X' })).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('soft-deletes by setting is_active = false', async () => {
      qr.query.mockResolvedValueOnce([{ id: DEAL_ID }]).mockResolvedValueOnce([])

      await service.remove(SCHEMA, DEAL_ID)

      const sql: string = qr.query.mock.calls[1][0] as string
      expect(sql).toContain('is_active = false')
    })
  })

  // ─── moveStage ────────────────────────────────────────────────────────────

  describe('moveStage', () => {
    it('updates stage and records history', async () => {
      const newStage = 'stage-2'
      qr.query
        .mockResolvedValueOnce([{ id: DEAL_ID, stage_id: STAGE_ID, status: 'open' }]) // fetchDealRowOrFail
        .mockResolvedValueOnce([{ id: newStage }]) // assertStageInPipeline
        .mockResolvedValueOnce([]) // UPDATE
        .mockResolvedValueOnce([]) // recordStageChange
      mockFetchDeal(qr, { stage_id: newStage }) // fetchDealOrFail

      const result = await service.moveStage(
        SCHEMA,
        DEAL_ID,
        {
          stageId: newStage,
          pipelineId: PIPELINE_ID,
        },
        USER_ID,
      )

      expect(result.stageId).toBe(newStage)
    })
  })

  // ─── markWon ──────────────────────────────────────────────────────────────

  describe('markWon', () => {
    it('sets status to won and records history', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: DEAL_ID, stage_id: STAGE_ID, status: 'open' }]) // fetchDealRowOrFail
        .mockResolvedValueOnce([]) // UPDATE
        .mockResolvedValueOnce([]) // recordStageChange
      mockFetchDeal(qr, { status: 'won' })

      const result = await service.markWon(SCHEMA, DEAL_ID, USER_ID)

      expect(result.status).toBe(DealStatus.WON)
    })

    it('throws BadRequestException if deal is already won', async () => {
      qr.query.mockResolvedValueOnce([{ id: DEAL_ID, stage_id: STAGE_ID, status: 'won' }])

      await expect(service.markWon(SCHEMA, DEAL_ID)).rejects.toThrow(BadRequestException)
    })

    it('throws BadRequestException if deal is lost', async () => {
      qr.query.mockResolvedValueOnce([{ id: DEAL_ID, stage_id: STAGE_ID, status: 'lost' }])

      await expect(service.markWon(SCHEMA, DEAL_ID)).rejects.toThrow(BadRequestException)
    })
  })

  // ─── markLost ─────────────────────────────────────────────────────────────

  describe('markLost', () => {
    it('sets status to lost with required loss reason', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: DEAL_ID, stage_id: STAGE_ID, status: 'open' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
      mockFetchDeal(qr, { status: 'lost', loss_reason: 'Price too high' })

      const result = await service.markLost(
        SCHEMA,
        DEAL_ID,
        { lossReason: 'Price too high' },
        USER_ID,
      )

      expect(result.status).toBe(DealStatus.LOST)
      expect(result.lossReason).toBe('Price too high')
    })

    it('throws BadRequestException if deal is not open', async () => {
      qr.query.mockResolvedValueOnce([{ id: DEAL_ID, stage_id: STAGE_ID, status: 'won' }])

      await expect(service.markLost(SCHEMA, DEAL_ID, { lossReason: 'test' })).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  // ─── reopen ───────────────────────────────────────────────────────────────

  describe('reopen', () => {
    it('reopens a won deal', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: DEAL_ID, stage_id: STAGE_ID, status: 'won' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
      mockFetchDeal(qr, { status: 'open' })

      const result = await service.reopen(SCHEMA, DEAL_ID, USER_ID)

      expect(result.status).toBe(DealStatus.OPEN)
    })

    it('throws BadRequestException if deal is already open', async () => {
      qr.query.mockResolvedValueOnce([{ id: DEAL_ID, stage_id: STAGE_ID, status: 'open' }])

      await expect(service.reopen(SCHEMA, DEAL_ID)).rejects.toThrow(BadRequestException)
    })
  })

  // ─── Deal Items ───────────────────────────────────────────────────────────

  describe('addItem', () => {
    it('inserts item and recalculates deal value', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: DEAL_ID }]) // assertDealExists
        .mockResolvedValueOnce([{ max_pos: 0 }]) // getNextItemPosition
        .mockResolvedValueOnce([makeItemRow()]) // INSERT RETURNING
        .mockResolvedValueOnce([]) // recalcDealValue

      const result = await service.addItem(SCHEMA, DEAL_ID, {
        description: 'Consulting service',
        unitPriceCents: 50000,
      })

      expect(result.description).toBe('Consulting service')
      expect(result.subtotalCents).toBe(90000) // 2 * 50000 * (100-10)/100 = 90000

      // Verify recalc was called
      const lastSql: string = qr.query.mock.calls[3][0] as string
      expect(lastSql).toContain('SUM(quantity * unit_price_cents')
    })
  })

  describe('updateItem', () => {
    it('updates item and recalculates deal value', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: ITEM_ID }]) // assertItemExists
        .mockResolvedValueOnce([]) // UPDATE
        .mockResolvedValueOnce([]) // recalcDealValue
        .mockResolvedValueOnce([makeItemRow({ quantity: 5 })]) // fetchItemOrFail

      const result = await service.updateItem(SCHEMA, DEAL_ID, ITEM_ID, { quantity: 5 })

      expect(result.quantity).toBe(5)
    })
  })

  describe('removeItem', () => {
    it('deletes item and recalculates deal value', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: ITEM_ID }]) // assertItemExists
        .mockResolvedValueOnce([]) // DELETE
        .mockResolvedValueOnce([]) // recalcDealValue

      await expect(service.removeItem(SCHEMA, DEAL_ID, ITEM_ID)).resolves.toBeUndefined()
    })

    it('throws NotFoundException for missing item', async () => {
      qr.query.mockResolvedValueOnce([]) // assertItemExists → empty

      await expect(service.removeItem(SCHEMA, DEAL_ID, 'missing')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('getItems', () => {
    it('returns items for a deal', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: DEAL_ID }]) // assertDealExists
        .mockResolvedValueOnce([makeItemRow(), makeItemRow({ id: 'item-2', position: 1 })])

      const result = await service.getItems(SCHEMA, DEAL_ID)

      expect(result).toHaveLength(2)
      expect(result[0]?.subtotalCents).toBe(90000)
    })
  })

  // ─── Forecast ─────────────────────────────────────────────────────────────

  describe('getForecast', () => {
    it('returns forecast grouped by month', async () => {
      qr.query.mockResolvedValueOnce([
        {
          month: '2026-04',
          total_value_cents: '10000000',
          weighted_value_cents: '5000000',
          deal_count: '3',
        },
        {
          month: '2026-05',
          total_value_cents: '8000000',
          weighted_value_cents: '4000000',
          deal_count: '2',
        },
      ])

      const result = await service.getForecast(SCHEMA)

      expect(result).toHaveLength(2)
      expect(result[0]?.month).toBe('2026-04')
      expect(result[0]?.totalValueCents).toBe(10000000)
      expect(result[0]?.weightedValueCents).toBe(5000000)
      expect(result[0]?.dealCount).toBe(3)
    })

    it('returns empty array when no deals have expected close dates', async () => {
      qr.query.mockResolvedValueOnce([])

      const result = await service.getForecast(SCHEMA)

      expect(result).toHaveLength(0)
    })
  })
})
