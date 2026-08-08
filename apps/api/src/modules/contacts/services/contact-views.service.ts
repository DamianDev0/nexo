import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { ContactView } from '@repo/shared-types'
import type {
  CreateContactViewDto,
  DuplicateContactViewDto,
  ReorderContactViewsDto,
  UpdateContactViewDto,
} from '../dto/contact-view.dto'
import { ContactViewsRepository } from '../repositories/contact-views.repository'
import { mapContactView } from '../mappers/contact-view.mapper'

@Injectable()
export class ContactViewsService {
  constructor(
    private readonly db: TenantDbService,
    private readonly repository: ContactViewsRepository,
  ) {}

  async findAll(schemaName: string, userId: string): Promise<ContactView[]> {
    const rows = await this.repository.findAllVisible(schemaName, userId)
    return rows.map((r) => mapContactView(r))
  }

  async create(
    schemaName: string,
    userId: string,
    dto: CreateContactViewDto,
  ): Promise<ContactView> {
    return this.db.transactional(schemaName, async (qr): Promise<ContactView> => {
      if (dto.isDefault) await this.repository.clearDefault(qr, userId)
      const position = await this.repository.nextPosition(qr, userId)
      const row = await this.repository.insert(qr, {
        ownerId: userId,
        name: dto.name,
        filters: dto.filters ?? {},
        advancedFilters: dto.advancedFilters ?? null,
        columns: dto.columns ?? {},
        sort: dto.sort ?? null,
        density: dto.density ?? 'comfortable',
        isDefault: dto.isDefault ?? false,
        isFavorite: dto.isFavorite ?? false,
        visibility: dto.visibility ?? 'private',
        position,
      })
      return mapContactView(row)
    })
  }

  async update(
    schemaName: string,
    userId: string,
    viewId: string,
    dto: UpdateContactViewDto,
  ): Promise<ContactView> {
    return this.db.transactional(schemaName, async (qr): Promise<ContactView> => {
      const existing = await this.repository.findById(qr, viewId)
      if (!existing) throw new NotFoundException(`Contact view ${viewId} not found`)
      if (existing.owner_id !== userId) {
        throw new ForbiddenException('Only the owner can modify this view')
      }
      if (dto.isDefault) await this.repository.clearDefault(qr, userId)
      const row = await this.repository.updateOwned(qr, viewId, userId, {
        name: dto.name ?? existing.name,
        filters: dto.filters ?? existing.filters,
        advancedFilters: dto.advancedFilters ?? existing.advanced_filters,
        columns: dto.columns ?? existing.columns,
        sort: dto.sort ?? existing.sort,
        density: dto.density ?? existing.density,
        isDefault: dto.isDefault ?? existing.is_default,
        isFavorite: dto.isFavorite ?? existing.is_favorite,
        visibility: dto.visibility ?? existing.visibility,
      })
      return mapContactView(row)
    })
  }

  async duplicate(
    schemaName: string,
    userId: string,
    viewId: string,
    dto: DuplicateContactViewDto,
  ): Promise<ContactView> {
    return this.db.transactional(schemaName, async (qr): Promise<ContactView> => {
      const source = await this.repository.findVisibleById(qr, viewId, userId)
      if (!source) throw new NotFoundException(`Contact view ${viewId} not found`)
      const position = await this.repository.nextPosition(qr, userId)
      const row = await this.repository.insertCopy(qr, {
        ownerId: userId,
        name: dto.name ?? `${source.name} (copy)`,
        filters: source.filters,
        advancedFilters: source.advanced_filters,
        columns: source.columns,
        sort: source.sort,
        density: source.density,
        position,
      })
      return mapContactView(row)
    })
  }

  async reorder(schemaName: string, userId: string, dto: ReorderContactViewsDto): Promise<void> {
    await this.repository.reorderOwned(schemaName, userId, dto.ids)
  }

  async remove(schemaName: string, userId: string, viewId: string): Promise<void> {
    const deleted = await this.repository.deleteOwned(schemaName, viewId, userId)
    if (!deleted) throw new NotFoundException(`Contact view ${viewId} not found`)
  }
}
