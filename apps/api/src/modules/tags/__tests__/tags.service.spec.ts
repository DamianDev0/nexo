import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TagsService } from '../services/tags.service'
import { TagsRepository } from '../repositories/tags.repository'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { buildDbMock, buildQrMock } from '@/shared/testing/tenant-db.mock'

const SCHEMA = 'tenant_acme'
const OTHER_SCHEMA = 'tenant_globex'

function makeTagRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tag-1',
    name: 'VIP',
    color: '#6B7280',
    entity_type: 'contact',
    enabled: true,
    deleted_at: null,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('TagsService', () => {
  let service: TagsService
  let db: ReturnType<typeof buildDbMock>
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(async () => {
    qr = buildQrMock()
    db = buildDbMock(qr)

    const module = await Test.createTestingModule({
      providers: [TagsService, TagsRepository, { provide: TenantDbService, useValue: db }],
    }).compile()

    service = module.get(TagsService)
  })

  describe('findAll', () => {
    it('returns a paginated page of tags mapped from rows', async () => {
      qr.query
        .mockResolvedValueOnce([{ count: '2' }])
        .mockResolvedValueOnce([makeTagRow(), makeTagRow({ id: 'tag-2', name: 'Hot' })])

      const result = await service.findAll(SCHEMA)

      expect(result.data).toHaveLength(2)
      expect(result.data[0]?.id).toBe('tag-1')
      expect(result.data[0]?.entityType).toBe('contact')
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(db.query).toHaveBeenCalledWith(SCHEMA, expect.any(Function))
    })

    it('filters by entityType in both count and page queries', async () => {
      qr.query
        .mockResolvedValueOnce([{ count: '1' }])
        .mockResolvedValueOnce([makeTagRow({ entity_type: 'deal' })])

      await service.findAll(SCHEMA, { entityType: 'deal' })

      const countSql: string = qr.query.mock.calls[0][0] as string
      const countParams: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(countSql).toContain('WHERE deleted_at IS NULL AND entity_type = $1')
      expect(countParams).toEqual(['deal'])

      const pageSql: string = qr.query.mock.calls[1][0] as string
      const pageParams: unknown[] = qr.query.mock.calls[1][1] as unknown[]
      expect(pageSql).toContain('WHERE deleted_at IS NULL AND entity_type = $1')
      expect(pageSql).toContain('LIMIT $2 OFFSET $3')
      expect(pageParams).toEqual(['deal', 25, 0])
    })

    it('applies page and limit as LIMIT/OFFSET bind params', async () => {
      qr.query.mockResolvedValueOnce([{ count: '30' }]).mockResolvedValueOnce([makeTagRow()])

      const result = await service.findAll(SCHEMA, { page: 3, limit: 10 })

      const pageSql: string = qr.query.mock.calls[1][0] as string
      const pageParams: unknown[] = qr.query.mock.calls[1][1] as unknown[]
      expect(pageSql).toContain('LIMIT $1 OFFSET $2')
      expect(pageParams).toEqual([10, 20])
      expect(result.page).toBe(3)
      expect(result.limit).toBe(10)
    })

    it('returns an empty page when no tags exist', async () => {
      qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

      const result = await service.findAll(SCHEMA)

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('create', () => {
    it('inserts a tag and returns the mapped result', async () => {
      qr.query.mockResolvedValueOnce([]).mockResolvedValueOnce([makeTagRow()])

      const result = await service.create(SCHEMA, { name: 'VIP', entityType: 'contact' })

      expect(result.id).toBe('tag-1')
      expect(result.name).toBe('VIP')
      const insertQuery: string = qr.query.mock.calls[1][0] as string
      expect(insertQuery).toContain('INSERT INTO tags')
      expect(insertQuery).toContain('RETURNING')
      expect(db.query).toHaveBeenCalledWith(SCHEMA, expect.any(Function))
    })

    it('defaults color when not provided', async () => {
      qr.query.mockResolvedValueOnce([]).mockResolvedValueOnce([makeTagRow()])

      await service.create(SCHEMA, { name: 'VIP', entityType: 'contact' })

      const params: unknown[] = qr.query.mock.calls[1][1] as unknown[]
      expect(params).toContain('#9CA3AF')
    })

    it('throws BadRequestException when a tag with the same name already exists for the entity type', async () => {
      qr.query.mockResolvedValueOnce([{ id: 'tag-existing', deleted_at: null }])

      await expect(service.create(SCHEMA, { name: 'VIP', entityType: 'contact' })).rejects.toThrow(
        BadRequestException,
      )
      expect(qr.query).toHaveBeenCalledTimes(1)
    })
  })

  describe('update (rename)', () => {
    it('renames a tag and returns the unwrapped row from a [rows, affectedCount] result', async () => {
      qr.query
        .mockResolvedValueOnce([{ name: 'VIP' }])
        .mockResolvedValueOnce([[makeTagRow({ name: 'Renamed' })], 1])
        .mockResolvedValueOnce([])

      const result = await service.update(SCHEMA, 'tag-1', { name: 'Renamed' })

      expect(result.id).toBe('tag-1')
      expect(result.name).toBe('Renamed')
      const updateQuery: string = qr.query.mock.calls[1][0] as string
      expect(updateQuery).toContain('UPDATE tags')
      expect(updateQuery).toContain('name = $')
      expect(updateQuery).toContain('RETURNING')
    })

    it('rewrites the renamed tag inside contacts.tags arrays', async () => {
      qr.query
        .mockResolvedValueOnce([{ name: 'VIP' }])
        .mockResolvedValueOnce([[makeTagRow({ name: 'Renamed' })], 1])
        .mockResolvedValueOnce([])

      await service.update(SCHEMA, 'tag-1', { name: 'Renamed' })

      const cleanupQuery: string = qr.query.mock.calls[2][0] as string
      const cleanupParams: unknown[] = qr.query.mock.calls[2][1] as unknown[]
      expect(cleanupQuery).toContain('array_replace(tags, $1, $2)')
      expect(cleanupParams).toEqual(['VIP', 'Renamed'])
    })

    it('renames a tag and returns the unwrapped row when the driver returns plain rows', async () => {
      qr.query
        .mockResolvedValueOnce([{ name: 'VIP' }])
        .mockResolvedValueOnce([makeTagRow({ name: 'Renamed' })])
        .mockResolvedValueOnce([])

      const result = await service.update(SCHEMA, 'tag-1', { name: 'Renamed' })

      expect(result.name).toBe('Renamed')
    })

    it('updates color as well as name', async () => {
      qr.query.mockResolvedValueOnce([[makeTagRow({ color: '#111111' })], 1])

      const result = await service.update(SCHEMA, 'tag-1', { color: '#111111' })

      expect(result.color).toBe('#111111')
      const updateQuery: string = qr.query.mock.calls[0][0] as string
      expect(updateQuery).toContain('color = $')
    })

    it('returns the existing tag unchanged when no fields are provided', async () => {
      qr.query.mockResolvedValueOnce([makeTagRow()])

      const result = await service.update(SCHEMA, 'tag-1', {})

      expect(result.id).toBe('tag-1')
      expect(qr.query).toHaveBeenCalledTimes(1)
    })

    it('throws NotFoundException when renaming a nonexistent tag and the driver returns [[], 0]', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.update(SCHEMA, 'missing', { name: 'Ghost' })).rejects.toThrow(
        NotFoundException,
      )
    })

    it('throws NotFoundException when renaming a nonexistent tag and the driver returns plain empty rows', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.update(SCHEMA, 'missing', { name: 'Ghost' })).rejects.toThrow(
        NotFoundException,
      )
    })

    it('throws NotFoundException when no fields provided and the tag does not exist', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.update(SCHEMA, 'missing', {})).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('soft-deletes the tag, remembers who had it and takes it off contacts.tags', async () => {
      qr.query.mockResolvedValueOnce([[{ name: 'VIP' }], 1]).mockResolvedValueOnce([])

      await service.remove(SCHEMA, 'tag-1')

      const deleteQuery: string = qr.query.mock.calls[0][0] as string
      expect(deleteQuery).toContain('SET deleted_at = NOW()')
      expect(deleteQuery).toContain('deleted_from_contact_ids')
      expect(deleteQuery).toContain('deleted_at IS NULL')
      expect(deleteQuery).not.toContain('DELETE FROM tags')

      const cleanupQuery: string = qr.query.mock.calls[1][0] as string
      const cleanupParams: unknown[] = qr.query.mock.calls[1][1] as unknown[]
      expect(cleanupQuery).toContain('array_remove(tags, $1)')
      expect(cleanupParams).toEqual(['VIP'])
    })

    it('throws NotFoundException and skips the cleanup when nothing was deleted', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.remove(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
      expect(qr.query).toHaveBeenCalledTimes(1)
    })
  })

  describe('restore', () => {
    it('revives the tag and re-attaches it to the contacts that had it', async () => {
      qr.query
        .mockResolvedValueOnce([{ name: 'VIP', deleted_from_contact_ids: ['c-1', 'c-2'] }])
        .mockResolvedValueOnce([makeTagRow({ deleted_at: null })])
        .mockResolvedValueOnce([])

      const tag = await service.restore(SCHEMA, 'tag-1')

      expect(tag.deletedAt).toBeNull()
      const reviveQuery: string = qr.query.mock.calls[1][0] as string
      expect(reviveQuery).toContain('SET deleted_at = NULL')
      const [reattachQuery, reattachParams] = qr.query.mock.calls[2] as [string, unknown[]]
      expect(reattachQuery).toContain('array_append(tags, $1)')
      expect(reattachParams).toEqual(['VIP', ['c-1', 'c-2']])
    })

    it('does not touch contacts when the tag had none', async () => {
      qr.query
        .mockResolvedValueOnce([{ name: 'VIP', deleted_from_contact_ids: [] }])
        .mockResolvedValueOnce([makeTagRow()])

      await service.restore(SCHEMA, 'tag-1')

      expect(qr.query).toHaveBeenCalledTimes(2)
    })

    it('throws NotFoundException for tags that are not in the trash', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.restore(SCHEMA, 'tag-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('revives a trashed tag with the same name instead of failing on the unique index', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: 'tag-old', deleted_at: '2026-09-01T00:00:00Z' }])
        .mockResolvedValueOnce([makeTagRow({ id: 'tag-old' })])

      const tag = await service.create(SCHEMA, { name: 'VIP', entityType: 'contact' })

      expect(tag.id).toBe('tag-old')
      const reviveQuery: string = qr.query.mock.calls[1][0] as string
      expect(reviveQuery).toContain('SET deleted_at = NULL')
      expect(reviveQuery).not.toContain('INSERT')
    })

    it('rejects a duplicate that is still active', async () => {
      qr.query.mockResolvedValueOnce([{ id: 'tag-1', deleted_at: null }])

      await expect(service.create(SCHEMA, { name: 'VIP', entityType: 'contact' })).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('tenant isolation', () => {
    it('runs findAll against the resolved tenant schema, not another tenant', async () => {
      qr.query.mockResolvedValueOnce([{ count: '1' }]).mockResolvedValueOnce([makeTagRow()])

      await service.findAll(SCHEMA)

      expect(db.query).toHaveBeenCalledWith(SCHEMA, expect.any(Function))
      expect(db.query).not.toHaveBeenCalledWith(OTHER_SCHEMA, expect.any(Function))
    })

    it('runs remove against the resolved tenant schema, not another tenant', async () => {
      qr.query.mockResolvedValueOnce([[{ name: 'VIP' }], 1]).mockResolvedValueOnce([])

      await service.remove(SCHEMA, 'tag-1')

      expect(db.query).toHaveBeenCalledWith(SCHEMA, expect.any(Function))
      expect(db.query).not.toHaveBeenCalledWith(OTHER_SCHEMA, expect.any(Function))
    })
  })
})
