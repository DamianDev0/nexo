import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ProductsService } from '../products.service'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { CsvExportService } from '@/shared/csv/csv-export.service'
import { ImportService } from '@/shared/imports/services/import.service'
import type { PaginatedProducts } from '@repo/shared-types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SCHEMA = 'tenant_acme'
const PRODUCT_ID = 'prod-1'
const USER_ID = 'user-1'

function makeProductRow(overrides: Record<string, unknown> = {}) {
  return {
    id: PRODUCT_ID,
    name: 'Widget Pro',
    sku: 'WDG-001',
    barcode: '7701234567890',
    description: 'High quality widget',
    category: 'Electronics',
    brand: 'WidgetCo',
    price_cents: '15000',
    cost_cents: '8000',
    iva_rate: 19,
    product_type: 'product',
    unit_of_measure: 'unit',
    currency: 'COP',
    stock: 50,
    min_stock: 10,
    weight_grams: 250,
    tags: ['electronics', 'widget'],
    images: ['https://img.test/widget.jpg'],
    custom_fields: {},
    is_active: true,
    created_by: USER_ID,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeMovementRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'mov-1',
    product_id: PRODUCT_ID,
    quantity: 10,
    movement_type: 'purchase',
    reference_type: null,
    reference_id: null,
    notes: 'Initial stock',
    created_by: USER_ID,
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
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProductsService', () => {
  let service: ProductsService
  let qr: ReturnType<typeof buildQrMock>

  beforeEach(async () => {
    qr = buildQrMock()
    const db = buildDbMock(qr)

    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: TenantDbService, useValue: db },
        { provide: CsvExportService, useValue: { toBuffer: jest.fn() } },
        {
          provide: ImportService,
          useValue: { analyze: jest.fn(), getRowsForExecution: jest.fn() },
        },
      ],
    }).compile()

    service = module.get(ProductsService)
  })

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns paginated products', async () => {
      qr.query
        .mockResolvedValueOnce([{ count: '2' }])
        .mockResolvedValueOnce([makeProductRow(), makeProductRow({ id: 'prod-2' })])

      const result: PaginatedProducts = await service.findAll(SCHEMA, {})

      expect(result.total).toBe(2)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]?.priceCents).toBe(15000)
    })

    it('applies text search filter (name/sku/barcode)', async () => {
      qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

      await service.findAll(SCHEMA, { q: 'widget' })

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('ILIKE')
    })

    it('applies category filter', async () => {
      qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

      await service.findAll(SCHEMA, { category: 'Electronics' })

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('category = $')
    })

    it('applies low stock filter', async () => {
      qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

      await service.findAll(SCHEMA, { lowStock: 'true' })

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('stock <= min_stock')
    })

    it('applies product type filter', async () => {
      qr.query.mockResolvedValueOnce([{ count: '0' }]).mockResolvedValueOnce([])

      await service.findAll(SCHEMA, { productType: 'service' })

      const sql: string = qr.query.mock.calls[0][0] as string
      expect(sql).toContain('product_type = $')
    })
  })

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns full product detail', async () => {
      qr.query.mockResolvedValueOnce([makeProductRow()])

      const result = await service.findOne(SCHEMA, PRODUCT_ID)

      expect(result.id).toBe(PRODUCT_ID)
      expect(result.name).toBe('Widget Pro')
      expect(result.description).toBe('High quality widget')
      expect(result.tags).toEqual(['electronics', 'widget'])
    })

    it('throws NotFoundException for missing product', async () => {
      qr.query.mockResolvedValueOnce([])

      await expect(service.findOne(SCHEMA, 'missing')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── findOneWithMovements ─────────────────────────────────────────────────

  describe('findOneWithMovements', () => {
    it('returns product with movement history', async () => {
      qr.query
        .mockResolvedValueOnce([makeProductRow()])
        .mockResolvedValueOnce([
          makeMovementRow(),
          makeMovementRow({ id: 'mov-2', movement_type: 'sale', quantity: 3 }),
        ])

      const result = await service.findOneWithMovements(SCHEMA, PRODUCT_ID)

      expect(result.movements).toHaveLength(2)
      expect(result.movements[0]?.movementType).toBe('purchase')
      expect(result.movements[1]?.quantity).toBe(3)
    })
  })

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('inserts product and returns detail', async () => {
      qr.query
        .mockResolvedValueOnce([]) // assertSkuUnique
        .mockResolvedValueOnce([{ id: PRODUCT_ID }]) // INSERT
        .mockResolvedValueOnce([makeProductRow()]) // fetchProductOrFail

      const result = await service.create(
        SCHEMA,
        {
          name: 'Widget Pro',
          sku: 'WDG-001',
          priceCents: 15000,
        },
        USER_ID,
      )

      expect(result.name).toBe('Widget Pro')
    })

    it('throws BadRequestException for duplicate SKU', async () => {
      qr.query.mockResolvedValueOnce([{ id: 'other' }]) // assertSkuUnique → found

      await expect(
        service.create(SCHEMA, { name: 'Dup', sku: 'WDG-001', priceCents: 1000 }, USER_ID),
      ).rejects.toThrow(BadRequestException)
    })

    it('skips SKU validation when no SKU provided', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: PRODUCT_ID }]) // INSERT (no assertSkuUnique)
        .mockResolvedValueOnce([makeProductRow({ sku: null })])

      const result = await service.create(SCHEMA, { name: 'No SKU', priceCents: 500 }, USER_ID)

      expect(result.sku).toBeNull()
    })
  })

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates fields and returns product', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: PRODUCT_ID }]) // assertProductExists
        .mockResolvedValueOnce([]) // UPDATE
        .mockResolvedValueOnce([makeProductRow({ name: 'Widget Pro V2' })])

      const result = await service.update(SCHEMA, PRODUCT_ID, { name: 'Widget Pro V2' })

      expect(result.name).toBe('Widget Pro V2')
    })

    it('validates SKU uniqueness on update', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: PRODUCT_ID }]) // assertProductExists
        .mockResolvedValueOnce([{ id: 'other-prod' }]) // assertSkuUnique → found

      await expect(service.update(SCHEMA, PRODUCT_ID, { sku: 'TAKEN-SKU' })).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('soft-deletes by setting is_active = false', async () => {
      qr.query.mockResolvedValueOnce([{ id: PRODUCT_ID }]).mockResolvedValueOnce([])

      await service.remove(SCHEMA, PRODUCT_ID)

      const sql: string = qr.query.mock.calls[1][0] as string
      expect(sql).toContain('is_active = false')
    })
  })

  // ─── adjustInventory ─────────────────────────────────────────────────────

  describe('adjustInventory', () => {
    it('records purchase movement and increases stock', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: PRODUCT_ID }]) // assertProductExists
        .mockResolvedValueOnce([makeMovementRow()]) // INSERT movement
        .mockResolvedValueOnce([]) // UPDATE stock

      const result = await service.adjustInventory(
        SCHEMA,
        PRODUCT_ID,
        {
          quantity: 10,
          movementType: 'purchase',
          notes: 'Restock',
        },
        USER_ID,
      )

      expect(result.movementType).toBe('purchase')
      expect(result.quantity).toBe(10)
    })

    it('checks stock for sale movements and throws if insufficient', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: PRODUCT_ID }]) // assertProductExists
        .mockResolvedValueOnce([makeProductRow({ stock: 5 })]) // fetchProductOrFail (for stock check)

      await expect(
        service.adjustInventory(
          SCHEMA,
          PRODUCT_ID,
          {
            quantity: 10,
            movementType: 'sale',
          },
          USER_ID,
        ),
      ).rejects.toThrow(BadRequestException)
    })

    it('allows sale when stock is sufficient', async () => {
      qr.query
        .mockResolvedValueOnce([{ id: PRODUCT_ID }]) // assertProductExists
        .mockResolvedValueOnce([makeProductRow({ stock: 50 })]) // fetchProductOrFail (stock check)
        .mockResolvedValueOnce([makeMovementRow({ movement_type: 'sale', quantity: 5 })]) // INSERT
        .mockResolvedValueOnce([]) // UPDATE stock

      const result = await service.adjustInventory(
        SCHEMA,
        PRODUCT_ID,
        {
          quantity: 5,
          movementType: 'sale',
        },
        USER_ID,
      )

      expect(result.movementType).toBe('sale')
    })
  })

  // ─── getLowStock ──────────────────────────────────────────────────────────

  describe('getLowStock', () => {
    it('returns products below minimum stock', async () => {
      qr.query.mockResolvedValueOnce([
        { id: 'prod-1', name: 'Widget', sku: 'WDG-001', stock: 3, min_stock: 10 },
        { id: 'prod-2', name: 'Gadget', sku: null, stock: 0, min_stock: 5 },
      ])

      const result = await service.getLowStock(SCHEMA)

      expect(result).toHaveLength(2)
      expect(result[0]?.stock).toBe(3)
      expect(result[0]?.minStock).toBe(10)
    })

    it('returns empty array when no low stock products', async () => {
      qr.query.mockResolvedValueOnce([])

      const result = await service.getLowStock(SCHEMA)

      expect(result).toHaveLength(0)
    })
  })
})
