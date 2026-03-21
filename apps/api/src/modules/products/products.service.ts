import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import type {
  AnalyzeResult,
  DuplicateStrategy,
  ImportResult,
  InventoryMovement,
  LowStockItem,
  MovementType,
  PaginatedProducts,
  Product,
  ProductListItem,
  ProductType,
  ProductWithMovements,
} from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { CsvExportService } from '@/shared/csv/csv-export.service'
import { ImportService } from '@/shared/imports/services/import.service'
import type {
  BulkPriceUpdateDto,
  CreateProductDto,
  InventoryAdjustmentDto,
  ProductQueryDto,
  UpdateProductDto,
} from './dto/product.dto'
import { productImportMapper } from './constants/product-import.mapper'
import type {
  LowStockRow,
  MovementRow,
  ProductListRow,
  ProductRow,
} from './interfaces/product-row.interfaces'
import {
  PRODUCT_ALL_COLUMNS,
  PRODUCT_LIST_COLUMNS,
  UPDATABLE_FIELDS,
} from './constants/product.constants'

// ─── Service ──────────────────────────────────────────────────────────────────

// ─── CSV column definitions for export ────────────────────────────────────────

const CSV_COLUMNS = [
  { header: 'name', value: (r: ProductRow) => r.name },
  { header: 'sku', value: (r: ProductRow) => r.sku ?? '' },
  { header: 'barcode', value: (r: ProductRow) => r.barcode ?? '' },
  { header: 'description', value: (r: ProductRow) => r.description ?? '' },
  { header: 'category', value: (r: ProductRow) => r.category ?? '' },
  { header: 'brand', value: (r: ProductRow) => r.brand ?? '' },
  { header: 'price_cents', value: (r: ProductRow) => r.price_cents },
  { header: 'cost_cents', value: (r: ProductRow) => r.cost_cents },
  { header: 'iva_rate', value: (r: ProductRow) => String(r.iva_rate) },
  { header: 'product_type', value: (r: ProductRow) => r.product_type },
  { header: 'unit_of_measure', value: (r: ProductRow) => r.unit_of_measure },
  { header: 'currency', value: (r: ProductRow) => r.currency },
  { header: 'stock', value: (r: ProductRow) => String(r.stock) },
  { header: 'min_stock', value: (r: ProductRow) => String(r.min_stock) },
  { header: 'tags', value: (r: ProductRow) => (r.tags ?? []).join(';') },
]

@Injectable()
export class ProductsService {
  constructor(
    private readonly db: TenantDbService,
    private readonly csvExport: CsvExportService,
    private readonly importService: ImportService,
  ) {}

  // ─── List ─────────────────────────────────────────────────────────────────

  async findAll(schemaName: string, query: ProductQueryDto): Promise<PaginatedProducts> {
    return this.db.query(schemaName, async (qr): Promise<PaginatedProducts> => {
      const page = query.page ?? 1
      const limit = query.limit ?? 25
      const offset = (page - 1) * limit

      const { where, params } = this.buildWhereClause(query)

      const countRows: [{ count: string }] = await qr.query(
        `SELECT COUNT(*)::text AS count FROM products WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const dataParams = [...params, limit, offset]
      const rows: ProductListRow[] = await qr.query(
        `SELECT ${PRODUCT_LIST_COLUMNS}
         FROM products
         WHERE ${where}
         ORDER BY name ASC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return { data: rows.map((r) => this.mapListItem(r)), total, page, limit }
    })
  }

  // ─── Find one ─────────────────────────────────────────────────────────────

  async findOne(schemaName: string, productId: string): Promise<Product> {
    return this.db.query(schemaName, (qr) => this.fetchProductOrFail(qr, productId))
  }

  // ─── Find one with movements ──────────────────────────────────────────────

  async findOneWithMovements(schemaName: string, productId: string): Promise<ProductWithMovements> {
    return this.db.query(schemaName, async (qr): Promise<ProductWithMovements> => {
      const product = await this.fetchProductOrFail(qr, productId)

      const movementRows: MovementRow[] = await qr.query(
        `SELECT * FROM inventory_movements
         WHERE product_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [productId],
      )

      return {
        ...product,
        movements: movementRows.map((r) => this.mapMovement(r)),
      }
    })
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(schemaName: string, dto: CreateProductDto, createdById: string): Promise<Product> {
    return this.db.query(schemaName, async (qr): Promise<Product> => {
      if (dto.sku) {
        await this.assertSkuUnique(qr, dto.sku)
      }

      const insertRows: [{ id: string }] = await qr.query(
        `INSERT INTO products (
           name, sku, barcode, description, category, brand,
           price_cents, cost_cents, iva_rate, product_type,
           unit_of_measure, currency, min_stock, weight_grams,
           tags, images, custom_fields, created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         RETURNING id`,
        [
          dto.name,
          dto.sku ?? null,
          dto.barcode ?? null,
          dto.description ?? null,
          dto.category ?? null,
          dto.brand ?? null,
          dto.priceCents,
          dto.costCents ?? 0,
          dto.ivaRate ?? 19,
          dto.productType ?? 'product',
          dto.unitOfMeasure ?? 'unit',
          dto.currency ?? 'COP',
          dto.minStock ?? 0,
          dto.weightGrams ?? null,
          dto.tags ?? [],
          dto.images ?? [],
          dto.customFields ?? {},
          createdById,
        ],
      )

      return this.fetchProductOrFail(qr, insertRows[0].id)
    })
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(schemaName: string, productId: string, dto: UpdateProductDto): Promise<Product> {
    return this.db.query(schemaName, async (qr): Promise<Product> => {
      await this.assertProductExists(qr, productId)

      if (dto.sku) {
        await this.assertSkuUnique(qr, dto.sku, productId)
      }

      const sets: string[] = ['updated_at = NOW()']
      const params: unknown[] = []

      for (const [dtoKey, col] of UPDATABLE_FIELDS) {
        if (dto[dtoKey] !== undefined) {
          params.push(dto[dtoKey])
          sets.push(`${col} = $${params.length}`)
        }
      }

      if (sets.length === 1) {
        return this.fetchProductOrFail(qr, productId)
      }

      params.push(productId)
      await qr.query(
        `UPDATE products SET ${sets.join(', ')} WHERE id = $${params.length} AND is_active = true`,
        params,
      )

      return this.fetchProductOrFail(qr, productId)
    })
  }

  // ─── Delete (soft) ────────────────────────────────────────────────────────

  async remove(schemaName: string, productId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      await this.assertProductExists(qr, productId)
      await qr.query(`UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1`, [
        productId,
      ])
    })
  }

  // ─── Inventory adjustment ─────────────────────────────────────────────────

  async adjustInventory(
    schemaName: string,
    productId: string,
    dto: InventoryAdjustmentDto,
    userId: string,
  ): Promise<InventoryMovement> {
    return this.db.transactional(schemaName, async (qr): Promise<InventoryMovement> => {
      const delta = this.getStockDelta(dto.movementType, dto.quantity)

      if (delta < 0) {
        const lockRows: [{ stock: number }?] = await qr.query(
          `SELECT stock FROM products WHERE id = $1 AND is_active = true FOR UPDATE`,
          [productId],
        )
        const locked = lockRows[0]
        if (!locked) throw new NotFoundException(`Product ${productId} not found`)
        if (locked.stock + delta < 0) {
          throw new BadRequestException(
            `Insufficient stock. Current: ${locked.stock}, requested: ${Math.abs(delta)}`,
          )
        }
      } else {
        await this.assertProductExists(qr, productId)
      }

      const movementRows: MovementRow[] = await qr.query(
        `INSERT INTO inventory_movements (product_id, quantity, movement_type, reference_type, reference_id, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          productId,
          dto.quantity,
          dto.movementType,
          dto.referenceType ?? null,
          dto.referenceId ?? null,
          dto.notes ?? null,
          userId,
        ],
      )

      // Update stock
      await qr.query(`UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2`, [
        delta,
        productId,
      ])

      const row = movementRows[0]
      if (!row) throw new BadRequestException('Failed to create movement')
      return this.mapMovement(row)
    })
  }

  // ─── Low stock alert ──────────────────────────────────────────────────────

  async getLowStock(schemaName: string): Promise<LowStockItem[]> {
    return this.db.query(schemaName, async (qr): Promise<LowStockItem[]> => {
      const rows: LowStockRow[] = await qr.query(
        `SELECT id, name, sku, stock, min_stock
         FROM products
         WHERE is_active = true
           AND product_type = 'product'
           AND stock <= min_stock
           AND min_stock > 0
         ORDER BY (stock::float / NULLIF(min_stock, 0)) ASC`,
      )

      return rows.map(
        (r): LowStockItem => ({
          id: r.id,
          name: r.name,
          sku: r.sku,
          stock: r.stock,
          minStock: r.min_stock,
        }),
      )
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  Export / Import / Duplicate / Bulk
  // ═══════════════════════════════════════════════════════════════════════════

  async exportCsv(schemaName: string): Promise<Buffer> {
    return this.db.query(schemaName, async (qr): Promise<Buffer> => {
      const rows: ProductRow[] = await qr.query(
        `SELECT ${PRODUCT_ALL_COLUMNS} FROM products WHERE is_active = true ORDER BY name ASC`,
      )
      return this.csvExport.toBuffer(rows, CSV_COLUMNS)
    })
  }

  async analyzeImport(file: {
    buffer: Buffer
    originalname: string
    mimetype: string
    size: number
  }): Promise<AnalyzeResult> {
    return this.importService.analyze(file, productImportMapper)
  }

  async executeImport(
    schemaName: string,
    fileId: string,
    mapping: Record<string, string | null>,
    duplicateStrategy: DuplicateStrategy,
    createdById: string,
  ): Promise<ImportResult> {
    const { rows, cleanup } = await this.importService.getRowsForExecution(
      fileId,
      mapping,
      productImportMapper,
    )

    return this.db.transactional(schemaName, async (qr): Promise<ImportResult> => {
      let imported = 0
      let updated = 0
      let skipped = 0
      const errors: { row: number; message: string }[] = []

      for (const [i, { data, errors: rowErrors }] of rows.entries()) {
        if (rowErrors.length > 0) {
          errors.push({ row: i + 2, message: rowErrors.join('; ') })
          skipped++
          continue
        }

        const name = data['name'] as string | undefined
        if (!name) {
          errors.push({ row: i + 2, message: 'Name is required' })
          skipped++
          continue
        }

        const sku = (data['sku'] as string) || null

        if (sku && (await this.skuExists(qr, sku))) {
          if (duplicateStrategy === 'update') {
            await this.updateBySku(qr, sku, data)
            updated++
          } else if (duplicateStrategy === 'skip') {
            skipped++
          } else {
            await this.insertImportRow(qr, data, name, null, createdById) // create with no SKU
            imported++
          }
          continue
        }

        await this.insertImportRow(qr, data, name, sku, createdById)
        imported++
      }

      cleanup()
      return { imported, updated, skipped, errors }
    })
  }

  async duplicate(schemaName: string, productId: string, userId: string): Promise<Product> {
    return this.db.query(schemaName, async (qr): Promise<Product> => {
      const source = await this.fetchProductOrFail(qr, productId)

      const newSku = source.sku ? `${source.sku}-COPY` : null

      const insertRows: [{ id: string }] = await qr.query(
        `INSERT INTO products (
           name, sku, barcode, description, category, brand,
           price_cents, cost_cents, iva_rate, product_type,
           unit_of_measure, currency, min_stock, weight_grams,
           tags, images, custom_fields, created_by
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         RETURNING id`,
        [
          `${source.name} (copy)`,
          newSku,
          null, // barcode must be unique per product
          source.description,
          source.category,
          source.brand,
          source.priceCents,
          source.costCents,
          source.ivaRate,
          source.productType,
          source.unitOfMeasure,
          source.currency,
          source.minStock,
          source.weightGrams,
          source.tags,
          source.images,
          source.customFields,
          userId,
        ],
      )

      return this.fetchProductOrFail(qr, insertRows[0].id)
    })
  }

  async bulkPriceUpdate(schemaName: string, dto: BulkPriceUpdateDto): Promise<{ updated: number }> {
    return this.db.query(schemaName, async (qr): Promise<{ updated: number }> => {
      if (!dto.category && !dto.brand) {
        throw new BadRequestException('At least one filter (category or brand) is required')
      }

      const conditions: string[] = ['is_active = true']
      const params: unknown[] = []

      if (dto.category) {
        params.push(dto.category)
        conditions.push(`category = $${params.length}`)
      }

      if (dto.brand) {
        params.push(dto.brand)
        conditions.push(`brand = $${params.length}`)
      }

      // Calculate multiplier: +10% → 1.10, -5% → 0.95
      const multiplier = (100 + dto.percentChange) / 100
      params.push(multiplier)

      const filterParams = [...params] // save before adding multiplier
      params.push(multiplier)

      await qr.query(
        `UPDATE products
         SET price_cents = ROUND(price_cents * $${params.length}),
             updated_at = NOW()
         WHERE ${conditions.join(' AND ')}`,
        params,
      )

      const countRows: [{ count: string }] = await qr.query(
        `SELECT COUNT(*)::text AS count FROM products WHERE ${conditions.join(' AND ')}`,
        filterParams,
      )

      return { updated: Number.parseInt(countRows[0].count, 10) }
    })
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async fetchProductOrFail(qr: QueryRunner, productId: string): Promise<Product> {
    const rows: ProductRow[] = await qr.query(
      `SELECT ${PRODUCT_ALL_COLUMNS} FROM products WHERE id = $1 AND is_active = true`,
      [productId],
    )

    const row = rows[0]
    if (!row) throw new NotFoundException(`Product ${productId} not found`)
    return this.mapProduct(row)
  }

  private async assertProductExists(qr: QueryRunner, productId: string): Promise<void> {
    const rows: [{ id: string }?] = await qr.query(
      `SELECT id FROM products WHERE id = $1 AND is_active = true`,
      [productId],
    )

    if (rows.length === 0) {
      throw new NotFoundException(`Product ${productId} not found`)
    }
  }

  private async skuExists(qr: QueryRunner, sku: string): Promise<boolean> {
    const rows: [{ id: string }?] = await qr.query(
      `SELECT id FROM products WHERE sku = $1 AND is_active = true`,
      [sku],
    )
    return rows.length > 0
  }

  private async insertImportRow(
    qr: QueryRunner,
    data: Record<string, unknown>,
    name: string,
    sku: string | null,
    createdById: string,
  ): Promise<void> {
    await qr.query(
      `INSERT INTO products (
         name, sku, barcode, description, category, brand,
         price_cents, cost_cents, iva_rate, product_type,
         unit_of_measure, currency, stock, min_stock, tags, created_by
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        name,
        sku,
        data['barcode'] ?? null,
        data['description'] ?? null,
        data['category'] ?? null,
        data['brand'] ?? null,
        data['priceCents'] ?? 0,
        data['costCents'] ?? 0,
        data['ivaRate'] ?? 19,
        data['productType'] ?? 'product',
        data['unitOfMeasure'] ?? 'unit',
        data['currency'] ?? 'COP',
        data['stock'] ?? 0,
        data['minStock'] ?? 0,
        data['tags'] ?? [],
        createdById,
      ],
    )
  }

  private async updateBySku(
    qr: QueryRunner,
    sku: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const sets: string[] = ['updated_at = NOW()']
    const params: unknown[] = []

    const fieldMap: [string, string][] = [
      ['name', 'name'],
      ['description', 'description'],
      ['category', 'category'],
      ['brand', 'brand'],
      ['priceCents', 'price_cents'],
      ['costCents', 'cost_cents'],
      ['ivaRate', 'iva_rate'],
      ['productType', 'product_type'],
      ['unitOfMeasure', 'unit_of_measure'],
      ['currency', 'currency'],
      ['stock', 'stock'],
      ['minStock', 'min_stock'],
      ['tags', 'tags'],
    ]

    for (const [dtoKey, col] of fieldMap) {
      if (data[dtoKey] !== undefined) {
        params.push(data[dtoKey])
        sets.push(`${col} = $${params.length}`)
      }
    }

    if (sets.length === 1) return

    params.push(sku)
    await qr.query(
      `UPDATE products SET ${sets.join(', ')} WHERE sku = $${params.length} AND is_active = true`,
      params,
    )
  }

  private async assertSkuUnique(qr: QueryRunner, sku: string, excludeId?: string): Promise<void> {
    const params: unknown[] = [sku]
    let excludeClause = ''

    if (excludeId) {
      params.push(excludeId)
      excludeClause = ` AND id != $${params.length}`
    }

    const rows: [{ id: string }?] = await qr.query(
      `SELECT id FROM products WHERE sku = $1 AND is_active = true${excludeClause}`,
      params,
    )

    if (rows.length > 0) {
      throw new BadRequestException(`SKU "${sku}" already exists`)
    }
  }

  private getStockDelta(movementType: string, quantity: number): number {
    switch (movementType) {
      case 'purchase':
      case 'return':
        return quantity
      case 'sale':
      case 'transfer':
        return -quantity
      case 'adjustment':
        return quantity // can be positive or negative
      default:
        return 0
    }
  }

  private buildWhereClause(query: ProductQueryDto): { where: string; params: unknown[] } {
    const conditions: string[] = ['is_active = true']
    const params: unknown[] = []

    if (query.q) {
      params.push(query.q)
      conditions.push(
        `(name ILIKE '%' || $${params.length} || '%' OR sku ILIKE '%' || $${params.length} || '%' OR barcode = $${params.length})`,
      )
    }

    if (query.category) {
      params.push(query.category)
      conditions.push(`category = $${params.length}`)
    }

    if (query.brand) {
      params.push(query.brand)
      conditions.push(`brand = $${params.length}`)
    }

    if (query.productType) {
      params.push(query.productType)
      conditions.push(`product_type = $${params.length}`)
    }

    if (query.tags && query.tags.length > 0) {
      params.push(query.tags)
      conditions.push(`tags && $${params.length}`)
    }

    if (query.lowStock === 'true') {
      conditions.push('stock <= min_stock AND min_stock > 0')
    }

    return { where: conditions.join(' AND '), params }
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────

  private mapProduct(r: ProductRow): Product {
    return {
      id: r.id,
      name: r.name,
      sku: r.sku,
      barcode: r.barcode,
      description: r.description,
      category: r.category,
      brand: r.brand,
      priceCents: Number(r.price_cents),
      costCents: Number(r.cost_cents),
      ivaRate: r.iva_rate,
      productType: r.product_type as ProductType,
      unitOfMeasure: r.unit_of_measure,
      currency: r.currency,
      stock: r.stock,
      minStock: r.min_stock,
      weightGrams: r.weight_grams,
      tags: r.tags ?? [],
      images: r.images ?? [],
      customFields: r.custom_fields ?? {},
      isActive: r.is_active,
      createdById: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  }

  private mapListItem(r: ProductListRow): ProductListItem {
    return {
      id: r.id,
      name: r.name,
      sku: r.sku,
      barcode: r.barcode,
      category: r.category,
      brand: r.brand,
      priceCents: Number(r.price_cents),
      costCents: Number(r.cost_cents),
      ivaRate: r.iva_rate,
      productType: r.product_type as ProductType,
      unitOfMeasure: r.unit_of_measure,
      currency: r.currency,
      stock: r.stock,
      minStock: r.min_stock,
      weightGrams: r.weight_grams,
      tags: r.tags ?? [],
      isActive: r.is_active,
      createdById: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  }

  private mapMovement(r: MovementRow): InventoryMovement {
    return {
      id: r.id,
      productId: r.product_id,
      quantity: r.quantity,
      movementType: r.movement_type as MovementType,
      referenceType: r.reference_type,
      referenceId: r.reference_id,
      notes: r.notes,
      createdById: r.created_by,
      createdAt: r.created_at,
    }
  }
}
