import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ProductsController } from '../products.controller'
import { ProductsService } from '../products.service'
import type {
  Product,
  PaginatedProducts,
  TenantContext,
  AuthenticatedUser,
} from '@repo/shared-types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCtx: TenantContext = {
  tenantId: 't-1',
  schemaName: 'tenant_acme',
  slug: 'acme',
  plan: 'free',
  config: {},
  productName: 'NexoCRM',
  customDomain: null,
}
const mockUser: AuthenticatedUser = {
  id: 'user-1',
  email: 'a@b.co',
  role: 'sales_rep' as AuthenticatedUser['role'],
  tenantId: 't-1',
  schemaName: 'tenant_acme',
}

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Widget Pro',
  sku: 'WDG-001',
  barcode: null,
  description: 'A great widget',
  category: 'Electronics',
  brand: 'WidgetCo',
  priceCents: 15000,
  costCents: 8000,
  ivaRate: 19,
  productType: 'product',
  unitOfMeasure: 'unit',
  currency: 'COP',
  stock: 50,
  minStock: 10,
  weightGrams: 250,
  tags: ['electronics'],
  images: [],
  customFields: {},
  isActive: true,
  createdById: 'user-1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const mockPaginated: PaginatedProducts = {
  data: [{ ...mockProduct }],
  total: 1,
  page: 1,
  limit: 25,
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProductsController', () => {
  let controller: ProductsController
  let service: jest.Mocked<ProductsService>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findOneWithMovements: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            adjustInventory: jest.fn(),
            getLowStock: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get(ProductsController)
    service = module.get(ProductsService)
  })

  describe('findAll', () => {
    it('delegates to service with query', async () => {
      service.findAll.mockResolvedValue(mockPaginated)

      const result = await controller.findAll(mockCtx, { category: 'Electronics' })

      expect(service.findAll).toHaveBeenCalledWith('tenant_acme', { category: 'Electronics' })
      expect(result.total).toBe(1)
    })
  })

  describe('create', () => {
    it('delegates with dto and userId', async () => {
      service.create.mockResolvedValue(mockProduct)

      const result = await controller.create(
        { name: 'Widget Pro', priceCents: 15000 },
        mockCtx,
        mockUser,
      )

      expect(service.create).toHaveBeenCalledWith(
        'tenant_acme',
        { name: 'Widget Pro', priceCents: 15000 },
        'user-1',
      )
      expect(result.name).toBe('Widget Pro')
    })
  })

  describe('findOne', () => {
    it('returns product detail', async () => {
      service.findOne.mockResolvedValue(mockProduct)

      const result = await controller.findOne('prod-1', mockCtx)

      expect(result.sku).toBe('WDG-001')
    })

    it('propagates NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException())

      await expect(controller.findOne('missing', mockCtx)).rejects.toThrow(NotFoundException)
    })
  })

  describe('findOneWithMovements', () => {
    it('returns product with movements', async () => {
      service.findOneWithMovements.mockResolvedValue({ ...mockProduct, movements: [] })

      const result = await controller.findOneWithMovements('prod-1', mockCtx)

      expect(result.movements).toHaveLength(0)
    })
  })

  describe('update', () => {
    it('delegates to service', async () => {
      service.update.mockResolvedValue({ ...mockProduct, name: 'Updated' })

      const result = await controller.update('prod-1', { name: 'Updated' }, mockCtx)

      expect(result.name).toBe('Updated')
    })
  })

  describe('remove', () => {
    it('resolves void', async () => {
      service.remove.mockResolvedValue(undefined)

      await expect(controller.remove('prod-1', mockCtx)).resolves.toBeUndefined()
    })
  })

  describe('adjustInventory', () => {
    it('delegates with dto and userId', async () => {
      const mockMovement = {
        id: 'mov-1',
        productId: 'prod-1',
        quantity: 10,
        movementType: 'purchase' as const,
        referenceType: null,
        referenceId: null,
        notes: 'Restock',
        createdById: 'user-1',
        createdAt: '',
      }
      service.adjustInventory.mockResolvedValue(mockMovement)

      const result = await controller.adjustInventory(
        'prod-1',
        { quantity: 10, movementType: 'purchase', notes: 'Restock' },
        mockCtx,
        mockUser,
      )

      expect(service.adjustInventory).toHaveBeenCalledWith(
        'tenant_acme',
        'prod-1',
        { quantity: 10, movementType: 'purchase', notes: 'Restock' },
        'user-1',
      )
      expect(result.quantity).toBe(10)
    })
  })

  describe('getLowStock', () => {
    it('returns low stock items', async () => {
      service.getLowStock.mockResolvedValue([
        { id: 'prod-1', name: 'Widget', sku: 'WDG-001', stock: 3, minStock: 10 },
      ])

      const result = await controller.getLowStock(mockCtx)

      expect(result).toHaveLength(1)
      expect(result[0]?.stock).toBe(3)
    })
  })
})
