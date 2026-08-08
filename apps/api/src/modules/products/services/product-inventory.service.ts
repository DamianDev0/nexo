import { Injectable } from '@nestjs/common'
import type { InventoryMovement, LowStockItem } from '@repo/shared-types'
import { ProductsRepository } from '../repositories/products.repository'
import { mapInventoryMovement, mapLowStockItem } from '../mappers/product.mapper'
import type { InventoryAdjustmentDto } from '../dto/product.dto'

@Injectable()
export class ProductInventoryService {
  constructor(private readonly repository: ProductsRepository) {}

  async adjustInventory(
    schemaName: string,
    productId: string,
    dto: InventoryAdjustmentDto,
    userId: string,
  ): Promise<InventoryMovement> {
    const delta = this.getStockDelta(dto.movementType, dto.quantity)

    const row = await this.repository.recordMovement(schemaName, productId, delta, {
      quantity: dto.quantity,
      movementType: dto.movementType,
      referenceType: dto.referenceType ?? null,
      referenceId: dto.referenceId ?? null,
      notes: dto.notes ?? null,
      createdById: userId,
    })

    return mapInventoryMovement(row)
  }

  async getLowStock(schemaName: string): Promise<LowStockItem[]> {
    const rows = await this.repository.listLowStock(schemaName)
    return rows.map(mapLowStockItem)
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
        return quantity
      default:
        return 0
    }
  }
}
