import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TagsService } from '../tags.service'
import { TenantDbService } from '@/shared/database/tenant-db.service'

const SCHEMA = 'tenant_acme'
const OTHER_SCHEMA = 'tenant_globex'

function makeTagRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tag-1',
    name: 'VIP',
    color: '#6B7280',
    entity_type: 'contact',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function buildQrMock(overrides: Record<string, jest.Mock> = {}) {
  return { query: jest.fn(), ...overrides }
}

function buildDbMock(qr: ReturnType<typeof buildQrMock>) {
  return {
    query: jest.fn((schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
    transactional: jest.fn((schema: string, cb: (qr: unknown) => Promise<unknown>) => cb(qr)),
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
      providers: [TagsService, { provide: TenantDbService, useValue: db }],
    }).compile()

    service = module.get(TagsService)
  })

  describe('findAll', () => {
    it('returns all tags mapped from rows', async () => {
      qr.query.mockResolvedValueOnce([makeTagRow(), makeTagRow({ id: 'tag-2', name: 'Hot' })])

      const result = await service.findAll(SCHEMA)

      expect(result).toHaveLength(2)
      expect(result[0]?.id).toBe('tag-1')
      expect(result[0]?.entityType).toBe('contact')
      expect(db.query).toHaveBeenCalledWith(SCHEMA, expect.any(Function))
    })

    it('filters by entityType when provided', async () => {
      qr.query.mockResolvedValueOnce([makeTagRow({ entity_type: 'deal' })])

      await service.findAll(SCHEMA, 'deal')

      const sql: string = qr.query.mock.calls[0][0] as string
      const params: unknown[] = qr.query.mock.calls[0][1] as unknown[]
      expect(sql).toContain('WHERE entity_type = $1')
      expect(params).toEqual(['deal'])
    })

    it('returns an empty array when no tags exist', async () => {
      qr.query.mockResolvedValueOnce([])

      const result = await service.findAll(SCHEMA)

      expect(result).toEqual([])
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
      expect(params).toContain('#6B7280')
    })

    it('throws BadRequestException when a tag with the same name already exists for the entity type', async () => {
      qr.query.mockResolvedValueOnce([{ id: 'tag-existing' }])

      await expect(service.create(SCHEMA, { name: 'VIP', entityType: 'contact' })).rejects.toThrow(
        BadRequestException,
      )
      expect(qr.query).toHaveBeenCalledTimes(1)
    })
  })

  describe('update (rename)', () => {
    it('renames a tag and returns the unwrapped row from a [rows, affectedCount] result', async () => {
      qr.query.mockResolvedValueOnce([[makeTagRow({ name: 'Renamed' })], 1])

      const result = await service.update(SCHEMA, 'tag-1', { name: 'Renamed' })

      expect(result.id).toBe('tag-1')
      expect(result.name).toBe('Renamed')
      const updateQuery: string = qr.query.mock.calls[0][0] as string
      expect(updateQuery).toContain('UPDATE tags')
      expect(updateQuery).toContain('name = $')
      expect(updateQuery).toContain('RETURNING')
    })

    it('renames a tag and returns the unwrapped row when the driver returns plain rows', async () => {
      qr.query.mockResolvedValueOnce([makeTagRow({ name: 'Renamed' })])

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
      qr.query.mockResolvedValueOnce([[], 0])

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
    it('deletes the tag and removes it from contacts.tags via array_remove', async () => {
      qr.query.mockResolvedValueOnce([[{ name: 'VIP' }], 1]).mockResolvedValueOnce([])

      await service.remove(SCHEMA, 'tag-1')

      const deleteQuery: string = qr.query.mock.calls[0][0] as string
      expect(deleteQuery).toContain('DELETE FROM tags')
      expect(deleteQuery).toContain('RETURNING name')

      const cleanupQuery: string = qr.query.mock.calls[1][0] as string
      const cleanupParams: unknown[] = qr.query.mock.calls[1][1] as unknown[]
      expect(cleanupQuery).toContain('UPDATE contacts')
      expect(cleanupQuery).toContain('array_remove(tags, $1)')
      expect(cleanupParams).toEqual(['VIP'])
      expect(db.query).toHaveBeenCalledWith(SCHEMA, expect.any(Function))
    })

    it('deletes the tag when the driver returns plain rows and still cleans up contacts.tags', async () => {
      qr.query.mockResolvedValueOnce([{ name: 'Hot' }]).mockResolvedValueOnce([])

      await service.remove(SCHEMA, 'tag-1')

      const cleanupParams: unknown[] = qr.query.mock.calls[1][1] as unknown[]
      expect(cleanupParams).toEqual(['Hot'])
    })

    it('throws NotFoundException when deleting a nonexistent tag and the driver returns [[], 0]', async () => {
      qr.query.mockResolvedValueOnce([[], 0])

      await expect(service.remove(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
      expect(qr.query).toHaveBeenCalledTimes(1)
    })

    it('throws NotFoundException when deleting a nonexistent tag and the driver returns plain empty rows', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.remove(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
      expect(qr.query).toHaveBeenCalledTimes(1)
    })

    it('does not run the array_remove cleanup query when the tag does not exist', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.remove(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)

      const cleanupCalled = qr.query.mock.calls.some((call) =>
        String(call[0]).includes('array_remove'),
      )
      expect(cleanupCalled).toBe(false)
    })
  })

  describe('tenant isolation', () => {
    it('runs findAll against the resolved tenant schema, not another tenant', async () => {
      qr.query.mockResolvedValueOnce([makeTagRow()])

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
