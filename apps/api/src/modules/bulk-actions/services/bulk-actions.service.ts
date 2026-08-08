import { BadRequestException, Injectable } from '@nestjs/common'
import type { BulkActionResult, CustomFieldEntity } from '@repo/shared-types'
import { BulkActionsRepository } from '../repositories/bulk-actions.repository'

const ALLOWED_TABLES = new Set<CustomFieldEntity>(['contacts', 'companies', 'deals'])

@Injectable()
export class BulkActionsService {
  constructor(private readonly repository: BulkActionsRepository) {}

  async assign(
    schemaName: string,
    entity: string,
    ids: string[],
    assignedToId: string,
  ): Promise<BulkActionResult> {
    const table = this.validateTable(entity)
    return this.repository.assignMany(schemaName, table, ids, assignedToId)
  }

  async tag(
    schemaName: string,
    entity: string,
    ids: string[],
    tags: string[],
  ): Promise<BulkActionResult> {
    const table = this.validateTable(entity)
    return this.repository.addTagsMany(schemaName, table, ids, tags)
  }

  async untag(
    schemaName: string,
    entity: string,
    ids: string[],
    tags: string[],
  ): Promise<BulkActionResult> {
    const table = this.validateTable(entity)
    return this.repository.removeTagsMany(schemaName, table, ids, tags)
  }

  async softDelete(schemaName: string, entity: string, ids: string[]): Promise<BulkActionResult> {
    const table = this.validateTable(entity)
    await this.repository.deactivateMany(schemaName, table, ids)
    return { processed: ids.length, failed: 0, errors: [] }
  }

  private validateTable(entity: string): CustomFieldEntity {
    if (!ALLOWED_TABLES.has(entity as CustomFieldEntity)) {
      throw new BadRequestException(
        `Bulk actions not supported for entity "${entity}". Allowed: ${[...ALLOWED_TABLES].join(', ')}`,
      )
    }
    return entity as CustomFieldEntity
  }
}
