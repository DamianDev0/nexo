import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PipelineSettingsService } from '../services/pipeline-settings.service'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { CacheService } from '@/shared/cache/cache.service'
import type { Pipeline } from '@repo/shared-types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SCHEMA = 'tenant_acme'

const mockStageRow = {
  id: 'stage-1',
  pipeline_id: 'pipe-1',
  name: 'Prospecting',
  color: '#3B82F6',
  probability: 10,
  position: 0,
}

const mockPipelineRow = { id: 'pipe-1', name: 'Sales', is_default: true }

const mockPipeline: Pipeline = {
  id: 'pipe-1',
  name: 'Sales',
  isDefault: true,
  stages: [
    {
      id: 'stage-1',
      pipelineId: 'pipe-1',
      name: 'Prospecting',
      color: '#3B82F6',
      probability: 10,
      position: 0,
    },
  ],
}

// ─── Mock setup ───────────────────────────────────────────────────────────────

function buildQrMock() {
  return { query: jest.fn() }
}

function buildDbMock(qr: ReturnType<typeof buildQrMock>) {
  return {
    query: jest.fn((schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
    transactional: jest.fn((schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
  }
}

function buildCacheMock() {
  return {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PipelineSettingsService', () => {
  let service: PipelineSettingsService
  let db: ReturnType<typeof buildDbMock>
  let cache: ReturnType<typeof buildCacheMock>
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(async () => {
    qr = buildQrMock()
    db = buildDbMock(qr)
    cache = buildCacheMock()

    const module = await Test.createTestingModule({
      providers: [
        PipelineSettingsService,
        { provide: TenantDbService, useValue: db },
        { provide: CacheService, useValue: cache },
      ],
    }).compile()

    service = module.get(PipelineSettingsService)
  })

  // ─── findAll ────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns pipelines with their stages', async () => {
      cache.get.mockResolvedValue(null)
      qr.query.mockResolvedValueOnce([mockPipelineRow]).mockResolvedValueOnce([mockStageRow])

      const result = await service.findAll(SCHEMA)

      expect(result).toHaveLength(1)
      expect(result[0]?.name).toBe('Sales')
      expect(result[0]?.stages).toHaveLength(1)
    })

    it('returns cached result when available', async () => {
      cache.get.mockResolvedValue([mockPipeline])

      const result = await service.findAll(SCHEMA)

      expect(result).toEqual([mockPipeline])
      expect(db.query).not.toHaveBeenCalled()
    })

    it('stores result in cache after DB fetch', async () => {
      cache.get.mockResolvedValue(null)
      qr.query.mockResolvedValueOnce([mockPipelineRow]).mockResolvedValueOnce([mockStageRow])

      await service.findAll(SCHEMA)

      expect(cache.set).toHaveBeenCalledWith(`pipeline:list:${SCHEMA}`, expect.any(Array), 300)
    })

    it('returns empty array when no pipelines exist', async () => {
      cache.get.mockResolvedValue(null)
      qr.query.mockResolvedValueOnce([])

      const result = await service.findAll(SCHEMA)

      expect(result).toEqual([])
    })
  })

  // ─── findOne ────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns a pipeline by id with stages', async () => {
      cache.get.mockResolvedValue(null)
      qr.query.mockResolvedValueOnce([mockPipelineRow]).mockResolvedValueOnce([mockStageRow])

      const result = await service.findOne(SCHEMA, 'pipe-1')

      expect(result.id).toBe('pipe-1')
      expect(result.stages).toHaveLength(1)
    })

    it('returns cached result when available', async () => {
      cache.get.mockResolvedValue(mockPipeline)

      const result = await service.findOne(SCHEMA, 'pipe-1')

      expect(result).toEqual(mockPipeline)
      expect(db.query).not.toHaveBeenCalled()
    })

    it('throws NotFoundException when pipeline does not exist', async () => {
      cache.get.mockResolvedValue(null)
      qr.query.mockResolvedValueOnce([])

      await expect(service.findOne(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── create ─────────────────────────────────────────────────────────────

  describe('create', () => {
    it('inserts pipeline and stages, then invalidates list cache', async () => {
      qr.query
        .mockResolvedValueOnce([]) // clear default if isDefault
        .mockResolvedValueOnce([mockPipelineRow]) // INSERT pipeline
        .mockResolvedValueOnce([mockStageRow]) // INSERT stages

      const result = await service.create(SCHEMA, {
        name: 'Sales',
        isDefault: true,
        stages: [{ name: 'Prospecting', color: '#3B82F6', probability: 10, position: 0 }],
      })

      expect(result.name).toBe('Sales')
      expect(result.stages).toHaveLength(1)
      expect(cache.del).toHaveBeenCalledWith(`pipeline:list:${SCHEMA}`)
    })

    it('does not unset default when isDefault is false', async () => {
      qr.query.mockResolvedValueOnce([mockPipelineRow]).mockResolvedValueOnce([mockStageRow])

      await service.create(SCHEMA, {
        name: 'Secondary',
        isDefault: false,
        stages: [{ name: 'Lead', color: '#22C55E', probability: 5, position: 0 }],
      })

      // No UPDATE to clear defaults — first query is the INSERT, not the UPDATE
      const firstQuery: string = qr.query.mock.calls[0][0] as string
      expect(firstQuery).toContain('INSERT INTO pipelines')
    })
  })

  // ─── update ─────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates pipeline name and invalidates cache', async () => {
      qr.query
        .mockResolvedValueOnce([mockPipelineRow]) // fetchPipelineOrFail
        .mockResolvedValueOnce([{ ...mockPipelineRow, name: 'New Name' }]) // UPDATE RETURNING
        .mockResolvedValueOnce([mockStageRow]) // fetchStagesForPipeline

      const result = await service.update(SCHEMA, 'pipe-1', { name: 'New Name' })

      expect(result.name).toBe('New Name')
      expect(cache.del).toHaveBeenCalledTimes(2) // list + one key
    })

    it('returns existing pipeline when no fields to update', async () => {
      qr.query.mockResolvedValueOnce([mockPipelineRow]).mockResolvedValueOnce([mockStageRow])

      const result = await service.update(SCHEMA, 'pipe-1', {})

      expect(result.id).toBe('pipe-1')
      // No UPDATE query — only fetchPipelineOrFail + fetchStagesForPipeline
      const queries = qr.query.mock.calls.map((c) => c[0] as string)
      expect(queries.some((q) => q.includes('UPDATE pipelines'))).toBe(false)
    })
  })

  // ─── remove ─────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('throws BadRequestException when trying to delete the default pipeline', async () => {
      qr.query.mockResolvedValueOnce([{ ...mockPipelineRow, is_default: true }])

      await expect(service.remove(SCHEMA, 'pipe-1')).rejects.toThrow(BadRequestException)
    })

    it('throws BadRequestException when it is the only pipeline', async () => {
      qr.query
        .mockResolvedValueOnce([{ ...mockPipelineRow, is_default: false }])
        .mockResolvedValueOnce([{ count: '1' }])

      await expect(service.remove(SCHEMA, 'pipe-1')).rejects.toThrow(BadRequestException)
    })

    it('deletes stages and pipeline when valid', async () => {
      qr.query
        .mockResolvedValueOnce([{ ...mockPipelineRow, is_default: false }])
        .mockResolvedValueOnce([{ count: '3' }])
        .mockResolvedValueOnce([]) // DELETE stages
        .mockResolvedValueOnce([]) // DELETE pipeline

      await service.remove(SCHEMA, 'pipe-1')

      const deleteStagesQuery: string = qr.query.mock.calls[2][0] as string
      expect(deleteStagesQuery).toContain('DELETE FROM pipeline_stages')
    })

    it('throws NotFoundException when pipeline does not exist', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.remove(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── reorderStages ──────────────────────────────────────────────────────

  describe('reorderStages', () => {
    it('replaces all stages and invalidates cache', async () => {
      const newStage = { name: 'Closed', color: '#22C55E', probability: 100, position: 1 }
      qr.query
        .mockResolvedValueOnce([mockPipelineRow]) // fetchPipelineOrFail
        .mockResolvedValueOnce([]) // DELETE old stages
        .mockResolvedValueOnce([{ ...mockStageRow, ...newStage, id: 'stage-2' }]) // INSERT new

      const result = await service.reorderStages(SCHEMA, 'pipe-1', { stages: [newStage] })

      expect(result.stages).toHaveLength(1)
      expect(cache.del).toHaveBeenCalledTimes(2)
    })
  })
})
