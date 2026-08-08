import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { AuditLogService } from '@/modules/audit-log/services/audit-log.service'
import { AuditAction, AuditEntityType } from '@/modules/audit-log/interfaces/audit-log.interfaces'
import type { PaginatedProducts, Product, ProductWithMovements } from '@repo/shared-types'
import { CURRENCY_CODE, DEFAULT_PAGE_SIZE, DEFAULT_VAT_RATE } from '@repo/shared-utils'
import { ProductsRepository } from '../repositories/products.repository'
import { mapInventoryMovement, mapProduct, mapProductListItem } from '../mappers/product.mapper'
import { UPDATABLE_FIELDS } from '../constants/product.constants'
import type { ProductUpdateEntry } from '../interfaces/product-input.interfaces'
import type {
  BulkPriceUpdateDto,
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from '../dto/product.dto'

@Injectable()
export class ProductsService {
  constructor(
    private readonly repository: ProductsRepository,
    private readonly audit: AuditLogService,
  ) {}

  async findAll(schemaName: string, query: ProductQueryDto): Promise<PaginatedProducts> {
    const page = query.page ?? 1
    const limit = query.limit ?? DEFAULT_PAGE_SIZE
    const offset = (page - 1) * limit

    const { rows, total } = await this.repository.list(
      schemaName,
      {
        q: query.q,
        category: query.category,
        brand: query.brand,
        productType: query.productType,
        tags: query.tags,
        lowStock: query.lowStock === 'true',
      },
      limit,
      offset,
    )

    return { data: rows.map(mapProductListItem), total, page, limit }
  }

  async findOne(schemaName: string, productId: string): Promise<Product> {
    const row = await this.repository.findDetail(schemaName, productId)
    if (!row) throw new NotFoundException(`Product ${productId} not found`)
    return mapProduct(row)
  }

  async findOneWithMovements(schemaName: string, productId: string): Promise<ProductWithMovements> {
    const { product, movements } = await this.repository.findDetailWithMovements(
      schemaName,
      productId,
    )

    return {
      ...mapProduct(product),
      movements: movements.map(mapInventoryMovement),
    }
  }

  async create(schemaName: string, dto: CreateProductDto, createdById: string): Promise<Product> {
    const row = await this.repository.createProduct(schemaName, {
      name: dto.name,
      sku: dto.sku ?? null,
      barcode: dto.barcode ?? null,
      description: dto.description ?? null,
      category: dto.category ?? null,
      brand: dto.brand ?? null,
      priceCents: dto.priceCents,
      costCents: dto.costCents ?? 0,
      ivaRate: dto.ivaRate ?? DEFAULT_VAT_RATE,
      productType: dto.productType ?? 'product',
      unitOfMeasure: dto.unitOfMeasure ?? 'unit',
      currency: dto.currency ?? CURRENCY_CODE,
      minStock: dto.minStock ?? 0,
      weightGrams: dto.weightGrams ?? null,
      tags: dto.tags ?? [],
      images: dto.images ?? [],
      customFields: dto.customFields ?? {},
      createdById,
    })

    const result = mapProduct(row)
    void this.audit.entityEvent(
      schemaName,
      AuditAction.ProductCreated,
      AuditEntityType.Product,
      result.id,
      createdById,
      `Product "${dto.name}" created`,
    )
    return result
  }

  async update(schemaName: string, productId: string, dto: UpdateProductDto): Promise<Product> {
    const entries: ProductUpdateEntry[] = []
    for (const [dtoKey, col] of UPDATABLE_FIELDS) {
      if (dto[dtoKey] !== undefined) {
        entries.push([col, dto[dtoKey]])
      }
    }

    const row = await this.repository.update(schemaName, productId, dto.sku, entries)
    const result = mapProduct(row)

    if (entries.length > 0) {
      void this.audit.entityEvent(
        schemaName,
        AuditAction.ProductUpdated,
        AuditEntityType.Product,
        productId,
        undefined,
        `Product ${productId} updated`,
      )
    }
    return result
  }

  async remove(schemaName: string, productId: string): Promise<void> {
    await this.repository.softDelete(schemaName, productId)
    void this.audit.entityEvent(
      schemaName,
      AuditAction.ProductDeleted,
      AuditEntityType.Product,
      productId,
      undefined,
      `Product ${productId} deleted`,
    )
  }

  async duplicate(schemaName: string, productId: string, userId: string): Promise<Product> {
    const row = await this.repository.duplicateProduct(schemaName, productId, userId)
    return mapProduct(row)
  }

  async bulkPriceUpdate(schemaName: string, dto: BulkPriceUpdateDto): Promise<{ updated: number }> {
    if (!dto.category && !dto.brand) {
      throw new BadRequestException('At least one filter (category or brand) is required')
    }

    const multiplier = (100 + dto.percentChange) / 100
    const updated = await this.repository.bulkUpdatePrices(
      schemaName,
      dto.category,
      dto.brand,
      multiplier,
    )
    return { updated }
  }
}
