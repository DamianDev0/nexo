import { BadRequestException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ContactTaxonomyController } from '../controllers/contact-taxonomy.controller'
import { TenantConfigService } from '../services/tenant-config.service'
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service'
import { PlanName } from '@repo/shared-types'
import type { ContactTaxonomy, TaxonomyOption, TenantContext } from '@repo/shared-types'

const mockCtx: TenantContext = {
  tenantId: 'tenant-1',
  slug: 'acme',
  schemaName: 'tenant_acme',
  plan: PlanName.FREE,
  config: {},
  productName: 'NexoCRM',
  customDomain: null,
}

function option(overrides: Partial<TaxonomyOption> = {}): TaxonomyOption {
  return {
    key: 'new',
    label: null,
    description: null,
    color: '#3B82F6',
    order: 1,
    isSystem: true,
    enabled: true,
    ...overrides,
  }
}

const currentTaxonomy: ContactTaxonomy = {
  statuses: [option({ key: 'new' }), option({ key: 'qualified', order: 2 })],
  sources: [option({ key: 'manual' })],
  lifecycleStages: [option({ key: 'lead' }), option({ key: 'customer', order: 2 })],
}

function buildServiceMock() {
  return {
    getContactTaxonomy: jest.fn(),
    updateContactTaxonomy: jest.fn(),
  }
}

describe('ContactTaxonomyController', () => {
  let controller: ContactTaxonomyController
  let service: ReturnType<typeof buildServiceMock>

  beforeEach(async () => {
    service = buildServiceMock()
    service.getContactTaxonomy.mockResolvedValue(currentTaxonomy)

    const module = await Test.createTestingModule({
      controllers: [ContactTaxonomyController],
      providers: [
        { provide: TenantConfigService, useValue: service },
        { provide: AuditLogService, useValue: { settingsUpdated: jest.fn() } },
      ],
    }).compile()

    controller = module.get(ContactTaxonomyController)
  })

  describe('get', () => {
    it('delegates to the service with the tenant id', async () => {
      const result = await controller.get(mockCtx)

      expect(service.getContactTaxonomy).toHaveBeenCalledWith(mockCtx.tenantId)
      expect(result).toEqual(currentTaxonomy)
    })
  })

  describe('update', () => {
    it('rejects when a system status key is dropped, listing the missing keys', async () => {
      const dto = {
        statuses: [option({ key: 'new' })],
        sources: currentTaxonomy.sources,
        lifecycleStages: currentTaxonomy.lifecycleStages,
      }

      await expect(controller.update(dto, mockCtx)).rejects.toThrow(BadRequestException)
      await expect(controller.update(dto, mockCtx)).rejects.toThrow(/qualified/)
      expect(service.updateContactTaxonomy).not.toHaveBeenCalled()
    })

    it('rejects when a system source key is dropped, listing the missing keys', async () => {
      const dto = {
        statuses: currentTaxonomy.statuses,
        sources: [],
        lifecycleStages: currentTaxonomy.lifecycleStages,
      }

      await expect(controller.update(dto, mockCtx)).rejects.toThrow(BadRequestException)
      await expect(controller.update(dto, mockCtx)).rejects.toThrow(/manual/)
      expect(service.updateContactTaxonomy).not.toHaveBeenCalled()
    })

    it('rejects duplicate status keys', async () => {
      const dto = {
        statuses: [
          option({ key: 'new' }),
          option({ key: 'qualified', order: 2 }),
          option({ key: 'new', order: 3, isSystem: false }),
        ],
        sources: currentTaxonomy.sources,
        lifecycleStages: currentTaxonomy.lifecycleStages,
      }

      await expect(controller.update(dto, mockCtx)).rejects.toThrow(BadRequestException)
      await expect(controller.update(dto, mockCtx)).rejects.toThrow(/Duplicate status key/)
      expect(service.updateContactTaxonomy).not.toHaveBeenCalled()
    })

    it('rejects duplicate source keys', async () => {
      const dto = {
        statuses: currentTaxonomy.statuses,
        sources: [option({ key: 'manual' }), option({ key: 'manual', order: 2, isSystem: false })],
        lifecycleStages: currentTaxonomy.lifecycleStages,
      }

      await expect(controller.update(dto, mockCtx)).rejects.toThrow(/Duplicate source key/)
      expect(service.updateContactTaxonomy).not.toHaveBeenCalled()
    })

    it('passes valid updates through to the service, preserving custom options', async () => {
      const dto: ContactTaxonomy = {
        statuses: [
          ...currentTaxonomy.statuses,
          option({ key: 'custom_vip', order: 3, isSystem: false }),
        ],
        sources: currentTaxonomy.sources,
        lifecycleStages: currentTaxonomy.lifecycleStages,
      }
      service.updateContactTaxonomy.mockResolvedValue(dto)

      const result = await controller.update(dto, mockCtx)

      expect(service.updateContactTaxonomy).toHaveBeenCalledWith(
        mockCtx.tenantId,
        dto,
        mockCtx.slug,
      )
      expect(result).toEqual(dto)
    })

    it('allows relabelling or recolouring a system option without removing it', async () => {
      const dto: ContactTaxonomy = {
        statuses: [
          option({ key: 'new', label: 'Nuevo', color: '#000000' }),
          option({ key: 'qualified', order: 2 }),
        ],
        sources: currentTaxonomy.sources,
        lifecycleStages: currentTaxonomy.lifecycleStages,
      }
      service.updateContactTaxonomy.mockResolvedValue(dto)

      await controller.update(dto, mockCtx)

      expect(service.updateContactTaxonomy).toHaveBeenCalledWith(
        mockCtx.tenantId,
        dto,
        mockCtx.slug,
      )
    })
  })
})
