import { Test } from '@nestjs/testing'
import { DEFAULT_PAGE_SIZE } from '@repo/shared-utils'
import { TimelineService } from '../services/timeline.service'
import { TimelineRepository } from '../repositories/timeline.repository'
import type { TimelineRow } from '../interfaces/timeline-row.interfaces'

const SCHEMA = 'tenant_acme'
const ENTITY_ID = 'entity-1'

function makeRow(overrides: Partial<TimelineRow> = {}): TimelineRow {
  return {
    id: 'row-1',
    event_type: 'activity',
    title: 'Called the contact',
    description: null,
    entity_type: 'activity',
    entity_id: 'row-1',
    user_id: 'user-1',
    user_name: 'Jane Doe',
    metadata: {},
    created_at: '2026-08-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('TimelineService', () => {
  let service: TimelineService
  let repository: { findTimelinePage: jest.Mock }

  beforeEach(async () => {
    repository = { findTimelinePage: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [TimelineService, { provide: TimelineRepository, useValue: repository }],
    }).compile()

    service = module.get(TimelineService)
  })

  describe('getContactTimeline', () => {
    it('delegates to the repository with the contact_id filter column', async () => {
      repository.findTimelinePage.mockResolvedValue({ rows: [], total: 0 })

      await service.getContactTimeline(SCHEMA, ENTITY_ID)

      expect(repository.findTimelinePage).toHaveBeenCalledWith(
        SCHEMA,
        'contact_id',
        ENTITY_ID,
        DEFAULT_PAGE_SIZE,
        0,
      )
    })
  })

  describe('getDealTimeline', () => {
    it('delegates to the repository with the deal_id filter column', async () => {
      repository.findTimelinePage.mockResolvedValue({ rows: [], total: 0 })

      await service.getDealTimeline(SCHEMA, ENTITY_ID)

      expect(repository.findTimelinePage).toHaveBeenCalledWith(
        SCHEMA,
        'deal_id',
        ENTITY_ID,
        DEFAULT_PAGE_SIZE,
        0,
      )
    })
  })

  describe('getCompanyTimeline', () => {
    it('delegates to the repository with the company_id filter column', async () => {
      repository.findTimelinePage.mockResolvedValue({ rows: [], total: 0 })

      await service.getCompanyTimeline(SCHEMA, ENTITY_ID)

      expect(repository.findTimelinePage).toHaveBeenCalledWith(
        SCHEMA,
        'company_id',
        ENTITY_ID,
        DEFAULT_PAGE_SIZE,
        0,
      )
    })
  })

  describe('pagination', () => {
    it('defaults to page 1 and the default page size', async () => {
      repository.findTimelinePage.mockResolvedValue({ rows: [], total: 0 })

      const result = await service.getContactTimeline(SCHEMA, ENTITY_ID)

      expect(result.page).toBe(1)
      expect(result.limit).toBe(DEFAULT_PAGE_SIZE)
    })

    it('converts page number into a zero-based offset for the repository', async () => {
      repository.findTimelinePage.mockResolvedValue({ rows: [], total: 0 })

      await service.getContactTimeline(SCHEMA, ENTITY_ID, 3, 10)

      expect(repository.findTimelinePage).toHaveBeenCalledWith(
        SCHEMA,
        'contact_id',
        ENTITY_ID,
        10,
        20,
      )
    })

    it('uses offset 0 for page 1 regardless of limit', async () => {
      repository.findTimelinePage.mockResolvedValue({ rows: [], total: 0 })

      await service.getContactTimeline(SCHEMA, ENTITY_ID, 1, 50)

      expect(repository.findTimelinePage).toHaveBeenCalledWith(
        SCHEMA,
        'contact_id',
        ENTITY_ID,
        50,
        0,
      )
    })

    it('propagates a NaN offset when given a non-numeric page, with no validation', async () => {
      repository.findTimelinePage.mockResolvedValue({ rows: [], total: 0 })

      await service.getContactTimeline(SCHEMA, ENTITY_ID, Number('not-a-page'), DEFAULT_PAGE_SIZE)

      const [, , , , offset] = repository.findTimelinePage.mock.calls[0] as [
        string,
        string,
        string,
        number,
        number,
      ]
      expect(Number.isNaN(offset)).toBe(true)
    })
  })

  describe('response shape', () => {
    it('returns an empty timeline when the repository has no rows', async () => {
      repository.findTimelinePage.mockResolvedValue({ rows: [], total: 0 })

      const result = await service.getContactTimeline(SCHEMA, ENTITY_ID)

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: DEFAULT_PAGE_SIZE })
    })

    it('maps rows from mixed entity types into timeline entries preserving order', async () => {
      const rows = [
        makeRow({ id: 'deal-1', event_type: 'deal_won', entity_type: 'deal', entity_id: 'deal-1' }),
        makeRow({
          id: 'act-1',
          event_type: 'activity',
          entity_type: 'activity',
          entity_id: 'act-1',
        }),
        makeRow({
          id: 'notif-1',
          event_type: 'invoice_paid',
          entity_type: 'invoice',
          entity_id: 'inv-1',
          user_name: null,
        }),
      ]
      repository.findTimelinePage.mockResolvedValue({ rows, total: 3 })

      const result = await service.getContactTimeline(SCHEMA, ENTITY_ID)

      expect(result.data.map((entry) => entry.id)).toEqual(['deal-1', 'act-1', 'notif-1'])
      expect(result.data.map((entry) => entry.eventType)).toEqual([
        'deal_won',
        'activity',
        'invoice_paid',
      ])
      expect(result.data[2]?.userName).toBeNull()
    })

    it('passes through the total reported by the repository even across pages', async () => {
      repository.findTimelinePage.mockResolvedValue({ rows: [makeRow()], total: 42 })

      const result = await service.getContactTimeline(SCHEMA, ENTITY_ID, 2, 10)

      expect(result.total).toBe(42)
      expect(result.page).toBe(2)
      expect(result.limit).toBe(10)
    })
  })
})
