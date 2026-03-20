import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { DealsController } from '../deals.controller'
import { DealsService } from '../deals.service'
import { DealStatus } from '@repo/shared-types'
import type {
  DealDetail,
  PaginatedDeals,
  TenantContext,
  AuthenticatedUser,
} from '@repo/shared-types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCtx: TenantContext = { tenantId: 'tenant-1', schemaName: 'tenant_acme', slug: 'acme' }
const mockUser: AuthenticatedUser = {
  id: 'user-1',
  email: 'a@b.co',
  role: 'sales_rep' as AuthenticatedUser['role'],
  tenantId: 'tenant-1',
}

const mockDeal: DealDetail = {
  id: 'deal-1',
  title: 'Big Deal',
  valueCents: 5000000,
  expectedCloseDate: '2026-06-30',
  stageId: 'stage-1',
  stageName: 'Propuesta',
  pipelineId: 'pipe-1',
  pipelineName: 'Ventas',
  contactId: 'cnt-1',
  companyId: 'co-1',
  assignedToId: 'user-1',
  lossReason: null,
  status: DealStatus.OPEN,
  customFields: {},
  isActive: true,
  createdById: 'user-1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  contact: { id: 'cnt-1', firstName: 'Juan', lastName: 'Pérez', email: 'j@t.co', phone: '300' },
  company: { id: 'co-1', name: 'Acme', nit: '900123456' },
  stage: { id: 'stage-1', name: 'Propuesta', color: '#F59E0B', probability: 50, position: 2 },
  pipeline: { id: 'pipe-1', name: 'Ventas' },
  items: [],
}

const mockPaginated: PaginatedDeals = {
  data: [{ ...mockDeal }],
  total: 1,
  page: 1,
  limit: 25,
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DealsController', () => {
  let controller: DealsController
  let service: jest.Mocked<DealsService>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [DealsController],
      providers: [
        {
          provide: DealsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            moveStage: jest.fn(),
            markWon: jest.fn(),
            markLost: jest.fn(),
            reopen: jest.fn(),
            addItem: jest.fn(),
            updateItem: jest.fn(),
            removeItem: jest.fn(),
            getItems: jest.fn(),
            getForecast: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get(DealsController)
    service = module.get(DealsService)
  })

  describe('findAll', () => {
    it('delegates to service', async () => {
      service.findAll.mockResolvedValue(mockPaginated)

      const result = await controller.findAll(mockCtx, { status: DealStatus.OPEN })

      expect(service.findAll).toHaveBeenCalledWith('tenant_acme', { status: DealStatus.OPEN })
      expect(result.total).toBe(1)
    })
  })

  describe('create', () => {
    it('delegates with dto and user id', async () => {
      service.create.mockResolvedValue(mockDeal)

      const result = await controller.create({ title: 'Big Deal' }, mockCtx, mockUser)

      expect(service.create).toHaveBeenCalledWith('tenant_acme', { title: 'Big Deal' }, 'user-1')
      expect(result.title).toBe('Big Deal')
    })
  })

  describe('findOne', () => {
    it('returns deal detail', async () => {
      service.findOne.mockResolvedValue(mockDeal)

      const result = await controller.findOne('deal-1', mockCtx)

      expect(result.contact?.firstName).toBe('Juan')
    })

    it('propagates NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException())

      await expect(controller.findOne('missing', mockCtx)).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('delegates to service', async () => {
      service.update.mockResolvedValue({ ...mockDeal, title: 'Updated' })

      const result = await controller.update('deal-1', { title: 'Updated' }, mockCtx)

      expect(result.title).toBe('Updated')
    })
  })

  describe('remove', () => {
    it('resolves void', async () => {
      service.remove.mockResolvedValue(undefined)

      await expect(controller.remove('deal-1', mockCtx)).resolves.toBeUndefined()
    })
  })

  describe('moveStage', () => {
    it('delegates with userId', async () => {
      service.moveStage.mockResolvedValue(mockDeal)

      await controller.moveStage(
        'deal-1',
        { stageId: 'stage-2', pipelineId: 'pipe-1' },
        mockCtx,
        mockUser,
      )

      expect(service.moveStage).toHaveBeenCalledWith(
        'tenant_acme',
        'deal-1',
        {
          stageId: 'stage-2',
          pipelineId: 'pipe-1',
        },
        'user-1',
      )
    })
  })

  describe('markWon', () => {
    it('delegates with userId', async () => {
      service.markWon.mockResolvedValue({ ...mockDeal, status: DealStatus.WON })

      const result = await controller.markWon('deal-1', mockCtx, mockUser)

      expect(service.markWon).toHaveBeenCalledWith('tenant_acme', 'deal-1', 'user-1')
      expect(result.status).toBe(DealStatus.WON)
    })
  })

  describe('markLost', () => {
    it('delegates with loss reason and userId', async () => {
      service.markLost.mockResolvedValue({
        ...mockDeal,
        status: DealStatus.LOST,
        lossReason: 'Budget',
      })

      const result = await controller.markLost(
        'deal-1',
        { lossReason: 'Budget' },
        mockCtx,
        mockUser,
      )

      expect(service.markLost).toHaveBeenCalledWith(
        'tenant_acme',
        'deal-1',
        { lossReason: 'Budget' },
        'user-1',
      )
      expect(result.lossReason).toBe('Budget')
    })
  })

  describe('reopen', () => {
    it('delegates with userId', async () => {
      service.reopen.mockResolvedValue({ ...mockDeal, status: DealStatus.OPEN })

      const result = await controller.reopen('deal-1', mockCtx, mockUser)

      expect(service.reopen).toHaveBeenCalledWith('tenant_acme', 'deal-1', 'user-1')
      expect(result.status).toBe(DealStatus.OPEN)
    })
  })

  describe('addItem', () => {
    it('delegates to service', async () => {
      const mockItem = {
        id: 'i-1',
        dealId: 'deal-1',
        productId: null,
        description: 'Test',
        quantity: 1,
        unitPriceCents: 1000,
        discountPercent: 0,
        ivaRate: 19,
        position: 0,
        subtotalCents: 1000,
        createdAt: '',
      }
      service.addItem.mockResolvedValue(mockItem)

      const result = await controller.addItem(
        'deal-1',
        { description: 'Test', unitPriceCents: 1000 },
        mockCtx,
      )

      expect(service.addItem).toHaveBeenCalledWith('tenant_acme', 'deal-1', {
        description: 'Test',
        unitPriceCents: 1000,
      })
      expect(result.description).toBe('Test')
    })
  })

  describe('removeItem', () => {
    it('resolves void', async () => {
      service.removeItem.mockResolvedValue(undefined)

      await expect(controller.removeItem('deal-1', 'item-1', mockCtx)).resolves.toBeUndefined()
    })
  })

  describe('getForecast', () => {
    it('returns forecast entries', async () => {
      service.getForecast.mockResolvedValue([
        { month: '2026-04', totalValueCents: 10000000, weightedValueCents: 5000000, dealCount: 3 },
      ])

      const result = await controller.getForecast(mockCtx)

      expect(result).toHaveLength(1)
      expect(result[0]?.month).toBe('2026-04')
    })
  })
})
