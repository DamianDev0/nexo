import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import type { ObjectView } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  CreateObjectViewDto,
  DuplicateObjectViewDto,
  ReorderObjectViewsDto,
  UpdateObjectViewDto,
} from '../dto/object-view.dto'
import type { ObjectTableDefinition } from '../interfaces/object-definition.interfaces'
import type { ObjectViewRow } from '../interfaces/object-view-row.interfaces'
import { columnMinWidths, sanitizeViewColumns } from '../mappers/object-table-state.mapper'
import { mapObjectView } from '../mappers/object-view.mapper'
import { ObjectViewsRepository } from '../repositories/object-views.repository'

@Injectable()
export class ObjectViewsService {
  constructor(
    private readonly db: TenantDbService,
    private readonly repository: ObjectViewsRepository,
  ) {}

  async findAll(
    schemaName: string,
    definition: ObjectTableDefinition,
    userId: string,
  ): Promise<ObjectView[]> {
    const catalog = columnMinWidths(definition.columns)
    const rows = await this.repository.findAllVisible(schemaName, definition.type, userId)
    return rows.map((row) => mapObjectView(row, catalog))
  }

  async create(
    schemaName: string,
    definition: ObjectTableDefinition,
    userId: string,
    dto: CreateObjectViewDto,
  ): Promise<ObjectView> {
    const { type } = definition
    const catalog = columnMinWidths(definition.columns)
    return this.db.transactional(schemaName, async (qr): Promise<ObjectView> => {
      await this.repository.lockOwner(qr, type, userId)
      if (dto.isDefault) await this.repository.clearDefault(qr, type, userId)
      const position = await this.repository.nextPosition(qr, type, userId)
      const row = await this.repository.insert(qr, {
        objectType: type,
        ownerId: userId,
        name: dto.name,
        description: dto.description ?? null,
        filters: dto.filters ?? {},
        advancedFilters: dto.advancedFilters ?? null,
        columns: sanitizeViewColumns(dto.columns, catalog),
        sort: dto.sort ?? null,
        density: dto.density ?? 'comfortable',
        isDefault: dto.isDefault ?? false,
        isFavorite: dto.isFavorite ?? false,
        visibility: dto.visibility ?? 'private',
        position,
      })
      return mapObjectView(this.requireInserted(row), catalog)
    })
  }

  async update(
    schemaName: string,
    definition: ObjectTableDefinition,
    userId: string,
    viewId: string,
    dto: UpdateObjectViewDto,
  ): Promise<ObjectView> {
    const { type } = definition
    const catalog = columnMinWidths(definition.columns)
    return this.db.transactional(schemaName, async (qr): Promise<ObjectView> => {
      await this.repository.lockOwner(qr, type, userId)
      const existing = await this.repository.findById(qr, type, viewId)
      if (!existing) throw new NotFoundException(`View ${viewId} not found`)
      if (existing.owner_id !== userId) {
        throw new ForbiddenException('Only the owner can modify this view')
      }
      if (dto.isDefault) await this.repository.clearDefault(qr, type, userId)
      const row = await this.repository.updateOwned(qr, type, viewId, userId, {
        name: dto.name ?? existing.name,
        description: dto.description ?? existing.description,
        filters: dto.filters ?? existing.filters,
        advancedFilters: dto.advancedFilters ?? existing.advanced_filters,
        columns: sanitizeViewColumns(dto.columns ?? existing.columns, catalog),
        sort: dto.sort ?? existing.sort,
        density: dto.density ?? existing.density,
        isDefault: dto.isDefault ?? existing.is_default,
        isFavorite: dto.isFavorite ?? existing.is_favorite,
        visibility: dto.visibility ?? existing.visibility,
      })
      if (!row) throw new NotFoundException(`View ${viewId} not found`)
      return mapObjectView(row, catalog)
    })
  }

  async duplicate(
    schemaName: string,
    definition: ObjectTableDefinition,
    userId: string,
    viewId: string,
    dto: DuplicateObjectViewDto,
  ): Promise<ObjectView> {
    const { type } = definition
    const catalog = columnMinWidths(definition.columns)
    return this.db.transactional(schemaName, async (qr): Promise<ObjectView> => {
      await this.repository.lockOwner(qr, type, userId)
      const source = await this.repository.findVisibleById(qr, type, viewId, userId)
      if (!source) throw new NotFoundException(`View ${viewId} not found`)
      const position = await this.repository.nextPosition(qr, type, userId)
      const row = await this.repository.insertCopy(qr, {
        objectType: type,
        ownerId: userId,
        name: dto.name ?? `${source.name} (copy)`,
        description: source.description,
        filters: source.filters,
        advancedFilters: source.advanced_filters,
        columns: sanitizeViewColumns(source.columns, catalog),
        sort: source.sort,
        density: source.density,
        position,
      })
      return mapObjectView(this.requireInserted(row), catalog)
    })
  }

  async reorder(
    schemaName: string,
    definition: ObjectTableDefinition,
    userId: string,
    dto: ReorderObjectViewsDto,
  ): Promise<void> {
    const reordered = await this.repository.reorderOwned(
      schemaName,
      definition.type,
      userId,
      dto.ids,
    )
    if (reordered !== dto.ids.length) {
      throw new NotFoundException('One or more views were not found')
    }
  }

  async remove(
    schemaName: string,
    definition: ObjectTableDefinition,
    userId: string,
    viewId: string,
  ): Promise<void> {
    const deleted = await this.repository.deleteOwned(schemaName, definition.type, viewId, userId)
    if (!deleted) throw new NotFoundException(`View ${viewId} not found`)
  }

  private requireInserted(row: ObjectViewRow | null): ObjectViewRow {
    if (!row) throw new InternalServerErrorException('View insert returned no row')
    return row
  }
}
