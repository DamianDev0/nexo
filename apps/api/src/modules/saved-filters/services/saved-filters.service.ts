import { Injectable, NotFoundException } from '@nestjs/common'
import type { SavedFilter, SavedFilterEntityType } from '@repo/shared-types'
import type {
  CreateSavedFilterData,
  UpdateSavedFilterData,
} from '../interfaces/saved-filter-row.interfaces'
import { toSavedFilter } from '../mappers/saved-filter.mapper'
import { SavedFiltersRepository } from '../repositories/saved-filters.repository'

@Injectable()
export class SavedFiltersService {
  constructor(private readonly repository: SavedFiltersRepository) {}

  async findAll(
    schemaName: string,
    userId: string,
    entityType?: SavedFilterEntityType,
  ): Promise<SavedFilter[]> {
    const rows = await this.repository.findAllByUser(schemaName, userId, entityType)
    return rows.map(toSavedFilter)
  }

  async create(
    schemaName: string,
    userId: string,
    data: CreateSavedFilterData,
  ): Promise<SavedFilter> {
    const row = await this.repository.insert(schemaName, userId, data)
    return toSavedFilter(row)
  }

  async update(
    schemaName: string,
    filterId: string,
    userId: string,
    data: UpdateSavedFilterData,
  ): Promise<SavedFilter> {
    const row = await this.repository.updateById(schemaName, filterId, userId, data)
    if (!row) throw new NotFoundException(`Filter ${filterId} not found`)
    return toSavedFilter(row)
  }

  async remove(schemaName: string, filterId: string, userId: string): Promise<void> {
    return this.repository.deleteById(schemaName, filterId, userId)
  }
}
