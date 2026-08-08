import { Injectable } from '@nestjs/common'
import type { DealItem } from '@repo/shared-types'
import { DealItemsRepository } from '../repositories/deal-items.repository'
import { mapDealItem } from '../mappers/deal.mapper'
import type { CreateDealItemDto, UpdateDealItemDto } from '../dto/deal.dto'

@Injectable()
export class DealItemsService {
  constructor(private readonly repository: DealItemsRepository) {}

  async getItems(schemaName: string, dealId: string): Promise<DealItem[]> {
    const rows = await this.repository.listByDeal(schemaName, dealId)
    return rows.map(mapDealItem)
  }

  async addItem(schemaName: string, dealId: string, dto: CreateDealItemDto): Promise<DealItem> {
    return mapDealItem(await this.repository.add(schemaName, dealId, dto))
  }

  async updateItem(
    schemaName: string,
    dealId: string,
    itemId: string,
    dto: UpdateDealItemDto,
  ): Promise<DealItem> {
    return mapDealItem(await this.repository.update(schemaName, dealId, itemId, dto))
  }

  async removeItem(schemaName: string, dealId: string, itemId: string): Promise<void> {
    return this.repository.remove(schemaName, dealId, itemId)
  }
}
