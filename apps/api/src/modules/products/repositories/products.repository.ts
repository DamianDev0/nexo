import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import type { DuplicateStrategy } from '@repo/shared-types'
import { CURRENCY_CODE, DEFAULT_VAT_RATE } from '@repo/shared-utils'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { PRODUCT_ALL_COLUMNS, PRODUCT_LIST_COLUMNS } from '../constants/product.constants'
import { mapProduct } from '../mappers/product.mapper'
import type {
  LowStockRow,
  MovementRow,
  ProductListRow,
  ProductRow,
} from '../interfaces/product-row.interfaces'
import type {
  ImportCounts,
  MovementInput,
  ProductCreateValues,
  ProductImportCandidate,
  ProductListFilters,
  ProductUpdateEntry,
} from '../interfaces/product-input.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class ProductsRepository {
  constructor(private readonly db: TenantDbService) {}

  async list(
    schemaName: string,
    filters: ProductListFilters,
    limit: number,
    offset: number,
  ): Promise<{ rows: ProductListRow[]; total: number }> {
    return this.db.query(schemaName, async (qr) => {
      const { where, params } = this.buildWhereClause(filters)

      const countRows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM products WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const dataParams = [...params, limit, offset]
      const rows = await sqlRows<ProductListRow[]>(
        qr,
        `SELECT ${PRODUCT_LIST_COLUMNS}
         FROM products
         WHERE ${where}
         ORDER BY name ASC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return { rows, total }
    })
  }

  async findDetail(schemaName: string, productId: string): Promise<ProductRow | null> {
    return this.db.query(schemaName, async (qr) => {
      const rows = await sqlRows<ProductRow[]>(
        qr,
        `SELECT ${PRODUCT_ALL_COLUMNS} FROM products WHERE id = $1 AND is_active = true`,
        [productId],
      )
      return rows[0] ?? null
    })
  }

  async findDetailWithMovements(
    schemaName: string,
    productId: string,
  ): Promise<{ product: ProductRow; movements: MovementRow[] }> {
    return this.db.query(schemaName, async (qr) => {
      const product = await this.fetchRowOrFail(qr, productId)

      const movements = await sqlRows<MovementRow[]>(
        qr,
        `SELECT * FROM inventory_movements
         WHERE product_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [productId],
      )

      return { product, movements }
    })
  }

  async createProduct(schemaName: string, values: ProductCreateValues): Promise<ProductRow> {
    return this.db.query(schemaName, async (qr): Promise<ProductRow> => {
      if (values.sku) {
        await this.assertSkuUnique(qr, values.sku)
      }

      const id = await this.insertProduct(qr, [
        values.name,
        values.sku,
        values.barcode,
        values.description,
        values.category,
        values.brand,
        values.priceCents,
        values.costCents,
        values.ivaRate,
        values.productType,
        values.unitOfMeasure,
        values.currency,
        values.minStock,
        values.weightGrams,
        values.tags,
        values.images,
        values.customFields,
        values.createdById,
      ])

      return this.fetchRowOrFail(qr, id)
    })
  }

  async update(
    schemaName: string,
    productId: string,
    sku: string | undefined,
    entries: ProductUpdateEntry[],
  ): Promise<ProductRow> {
    return this.db.query(schemaName, async (qr): Promise<ProductRow> => {
      await this.assertProductExists(qr, productId)

      if (sku) {
        await this.assertSkuUnique(qr, sku, productId)
      }

      const sets: string[] = ['updated_at = NOW()']
      const params: unknown[] = []

      for (const [col, value] of entries) {
        params.push(value)
        sets.push(`${col} = $${params.length}`)
      }

      if (sets.length === 1) {
        return this.fetchRowOrFail(qr, productId)
      }

      params.push(productId)
      await qr.query(
        `UPDATE products SET ${sets.join(', ')} WHERE id = $${params.length} AND is_active = true`,
        params,
      )

      return this.fetchRowOrFail(qr, productId)
    })
  }

  async softDelete(schemaName: string, productId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      await this.assertProductExists(qr, productId)
      await qr.query(`UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1`, [
        productId,
      ])
    })
  }

  async recordMovement(
    schemaName: string,
    productId: string,
    delta: number,
    movement: MovementInput,
  ): Promise<MovementRow> {
    return this.db.transactional(schemaName, async (qr): Promise<MovementRow> => {
      if (delta < 0) {
        const lockRows = await sqlRows<[{ stock: number }?]>(
          qr,
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

      const movementRows = await sqlRows<MovementRow[]>(
        qr,
        `INSERT INTO inventory_movements (product_id, quantity, movement_type, reference_type, reference_id, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          productId,
          movement.quantity,
          movement.movementType,
          movement.referenceType,
          movement.referenceId,
          movement.notes,
          movement.createdById,
        ],
      )

      await qr.query(`UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2`, [
        delta,
        productId,
      ])

      const row = movementRows[0]
      if (!row) throw new BadRequestException('Failed to create movement')
      return row
    })
  }

  async listLowStock(schemaName: string): Promise<LowStockRow[]> {
    return this.db.query(schemaName, async (qr): Promise<LowStockRow[]> => {
      return sqlRows<LowStockRow[]>(
        qr,
        `SELECT id, name, sku, stock, min_stock
         FROM products
         WHERE is_active = true
           AND product_type = 'product'
           AND stock <= min_stock
           AND min_stock > 0
         ORDER BY (stock::float / NULLIF(min_stock, 0)) ASC`,
      )
    })
  }

  async listAllActive(schemaName: string): Promise<ProductRow[]> {
    return this.db.query(schemaName, async (qr): Promise<ProductRow[]> => {
      return sqlRows<ProductRow[]>(
        qr,
        `SELECT ${PRODUCT_ALL_COLUMNS} FROM products WHERE is_active = true ORDER BY name ASC`,
      )
    })
  }

  async importRows(
    schemaName: string,
    candidates: ProductImportCandidate[],
    duplicateStrategy: DuplicateStrategy,
    createdById: string,
  ): Promise<ImportCounts> {
    return this.db.transactional(schemaName, async (qr): Promise<ImportCounts> => {
      let imported = 0
      let updated = 0
      let skipped = 0

      for (const { name, sku, data } of candidates) {
        if (sku && (await this.skuExists(qr, sku))) {
          if (duplicateStrategy === 'update') {
            await this.updateBySku(qr, sku, data)
            updated++
          } else if (duplicateStrategy === 'skip') {
            skipped++
          } else {
            await this.insertImportRow(qr, data, name, null, createdById)
            imported++
          }
          continue
        }

        await this.insertImportRow(qr, data, name, sku, createdById)
        imported++
      }

      return { imported, updated, skipped }
    })
  }

  async duplicateProduct(
    schemaName: string,
    productId: string,
    userId: string,
  ): Promise<ProductRow> {
    return this.db.query(schemaName, async (qr): Promise<ProductRow> => {
      const source = mapProduct(await this.fetchRowOrFail(qr, productId))

      const newSku = source.sku ? `${source.sku}-COPY` : null

      const id = await this.insertProduct(qr, [
        `${source.name} (copy)`,
        newSku,
        null,
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
      ])

      return this.fetchRowOrFail(qr, id)
    })
  }

  async bulkUpdatePrices(
    schemaName: string,
    category: string | undefined,
    brand: string | undefined,
    multiplier: number,
  ): Promise<number> {
    return this.db.query(schemaName, async (qr): Promise<number> => {
      const conditions: string[] = ['is_active = true']
      const params: unknown[] = []

      if (category) {
        params.push(category)
        conditions.push(`category = $${params.length}`)
      }

      if (brand) {
        params.push(brand)
        conditions.push(`brand = $${params.length}`)
      }

      params.push(multiplier)

      const filterParams = [...params]
      params.push(multiplier)

      await qr.query(
        `UPDATE products
         SET price_cents = ROUND(price_cents * $${params.length}),
             updated_at = NOW()
         WHERE ${conditions.join(' AND ')}`,
        params,
      )

      const countRows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM products WHERE ${conditions.join(' AND ')}`,
        filterParams,
      )

      return Number.parseInt(countRows[0].count, 10)
    })
  }

  private async insertProduct(qr: QueryRunner, params: unknown[]): Promise<string> {
    const insertRows = await sqlRows<[{ id: string }]>(
      qr,
      `INSERT INTO products (
         name, sku, barcode, description, category, brand,
         price_cents, cost_cents, iva_rate, product_type,
         unit_of_measure, currency, min_stock, weight_grams,
         tags, images, custom_fields, created_by
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING id`,
      params,
    )
    return insertRows[0].id
  }

  private async fetchRowOrFail(qr: QueryRunner, productId: string): Promise<ProductRow> {
    const rows = await sqlRows<ProductRow[]>(
      qr,
      `SELECT ${PRODUCT_ALL_COLUMNS} FROM products WHERE id = $1 AND is_active = true`,
      [productId],
    )

    const row = rows[0]
    if (!row) throw new NotFoundException(`Product ${productId} not found`)
    return row
  }

  private async assertProductExists(qr: QueryRunner, productId: string): Promise<void> {
    const rows = await sqlRows<[{ id: string }?]>(
      qr,
      `SELECT id FROM products WHERE id = $1 AND is_active = true`,
      [productId],
    )

    if (rows.length === 0) {
      throw new NotFoundException(`Product ${productId} not found`)
    }
  }

  private async skuExists(qr: QueryRunner, sku: string): Promise<boolean> {
    const rows = await sqlRows<[{ id: string }?]>(
      qr,
      `SELECT id FROM products WHERE sku = $1 AND is_active = true`,
      [sku],
    )
    return rows.length > 0
  }

  private async assertSkuUnique(qr: QueryRunner, sku: string, excludeId?: string): Promise<void> {
    const params: unknown[] = [sku]
    let excludeClause = ''

    if (excludeId) {
      params.push(excludeId)
      excludeClause = ` AND id != $${params.length}`
    }

    const rows = await sqlRows<[{ id: string }?]>(
      qr,
      `SELECT id FROM products WHERE sku = $1 AND is_active = true${excludeClause}`,
      params,
    )

    if (rows.length > 0) {
      throw new BadRequestException(`SKU "${sku}" already exists`)
    }
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
        data['ivaRate'] ?? DEFAULT_VAT_RATE,
        data['productType'] ?? 'product',
        data['unitOfMeasure'] ?? 'unit',
        data['currency'] ?? CURRENCY_CODE,
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

  private buildWhereClause(filters: ProductListFilters): { where: string; params: unknown[] } {
    const conditions: string[] = ['is_active = true']
    const params: unknown[] = []

    if (filters.q) {
      params.push(filters.q)
      conditions.push(
        `(name ILIKE '%' || $${params.length} || '%' OR sku ILIKE '%' || $${params.length} || '%' OR barcode = $${params.length})`,
      )
    }

    if (filters.category) {
      params.push(filters.category)
      conditions.push(`category = $${params.length}`)
    }

    if (filters.brand) {
      params.push(filters.brand)
      conditions.push(`brand = $${params.length}`)
    }

    if (filters.productType) {
      params.push(filters.productType)
      conditions.push(`product_type = $${params.length}`)
    }

    if (filters.tags && filters.tags.length > 0) {
      params.push(filters.tags)
      conditions.push(`tags && $${params.length}`)
    }

    if (filters.lowStock) {
      conditions.push('stock <= min_stock AND min_stock > 0')
    }

    return { where: conditions.join(' AND '), params }
  }
}
