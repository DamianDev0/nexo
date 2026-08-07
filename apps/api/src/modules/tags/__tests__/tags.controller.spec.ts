import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TagsController } from '../tags.controller'
import { TagsService } from '../tags.service'
import { PlanName } from '@repo/shared-types'
import type { Tag, TenantContext } from '@repo/shared-types'

const mockCtx: TenantContext = {
  tenantId: 'tenant-1',
  slug: 'acme',
  schemaName: 'tenant_acme',
  plan: PlanName.FREE,
  config: {},
  productName: 'NexoCRM',
  customDomain: null,
}

const otherTenantCtx: TenantContext = {
  ...mockCtx,
  tenantId: 'tenant-2',
  slug: 'globex',
  schemaName: 'tenant_globex',
}

const mockTag: Tag = {
  id: 'tag-1',
  name: 'VIP',
  color: '#6B7280',
  entityType: 'contact',
  createdAt: '2024-01-01T00:00:00Z',
}

function buildServiceMock() {
  return {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }
}

describe('TagsController', () => {
  let controller: TagsController
  let service: ReturnType<typeof buildServiceMock>

  beforeEach(async () => {
    service = buildServiceMock()

    const module = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [{ provide: TagsService, useValue: service }],
    }).compile()

    controller = module.get(TagsController)
  })

  describe('findAll', () => {
    it('delegates to service with schema and no entity type filter', async () => {
      service.findAll.mockResolvedValue([mockTag])

      const result = await controller.findAll(mockCtx, {})

      expect(service.findAll).toHaveBeenCalledWith(mockCtx.schemaName, undefined)
      expect(result).toEqual([mockTag])
    })

    it('passes entityType filter through to service', async () => {
      service.findAll.mockResolvedValue([])

      await controller.findAll(mockCtx, { entityType: 'deal' })

      expect(service.findAll).toHaveBeenCalledWith(mockCtx.schemaName, 'deal')
    })

    it('resolves against the requesting tenant schema only', async () => {
      service.findAll.mockResolvedValue([mockTag])

      await controller.findAll(otherTenantCtx, {})

      expect(service.findAll).toHaveBeenCalledWith(otherTenantCtx.schemaName, undefined)
      expect(service.findAll).not.toHaveBeenCalledWith(mockCtx.schemaName, undefined)
    })
  })

  describe('create', () => {
    it('delegates to service with schema and dto', async () => {
      service.create.mockResolvedValue(mockTag)

      const dto = { name: 'VIP', entityType: 'contact' as const }
      const result = await controller.create(dto, mockCtx)

      expect(service.create).toHaveBeenCalledWith(mockCtx.schemaName, dto)
      expect(result.id).toBe('tag-1')
    })
  })

  describe('update', () => {
    it('delegates to service with schema, id and dto', async () => {
      const renamed = { ...mockTag, name: 'Renamed' }
      service.update.mockResolvedValue(renamed)

      const result = await controller.update('tag-1', { name: 'Renamed' }, mockCtx)

      expect(service.update).toHaveBeenCalledWith(mockCtx.schemaName, 'tag-1', { name: 'Renamed' })
      expect(result.name).toBe('Renamed')
    })

    it('propagates NotFoundException from service when renaming a nonexistent tag', async () => {
      service.update.mockRejectedValue(new NotFoundException('Tag missing not found'))

      await expect(controller.update('missing', { name: 'Ghost' }, mockCtx)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('delegates to service with schema and id, returning void', async () => {
      service.remove.mockResolvedValue(undefined)

      await expect(controller.remove('tag-1', mockCtx)).resolves.toBeUndefined()
      expect(service.remove).toHaveBeenCalledWith(mockCtx.schemaName, 'tag-1')
    })

    it('propagates NotFoundException from service when deleting a nonexistent tag', async () => {
      service.remove.mockRejectedValue(new NotFoundException('Tag missing not found'))

      await expect(controller.remove('missing', mockCtx)).rejects.toThrow(NotFoundException)
    })
  })
})
