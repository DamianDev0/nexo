import { Injectable } from '@nestjs/common'
import { DEFAULT_PAGE_SIZE } from '@repo/shared-utils'
import type { PaginatedTags, Tag, TagEntityType } from '@repo/shared-types'
import { TagsRepository } from '../repositories/tags.repository'
import { mapTagRow } from '../mappers/tag.mapper'

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepository: TagsRepository) {}

  async findAll(
    schemaName: string,
    query: { entityType?: TagEntityType; deleted?: boolean; page?: number; limit?: number } = {},
  ): Promise<PaginatedTags> {
    const page = query.page ?? 1
    const limit = query.limit ?? DEFAULT_PAGE_SIZE
    const { rows, total } = await this.tagsRepository.findPage(schemaName, {
      entityType: query.entityType,
      deleted: query.deleted,
      page,
      limit,
    })
    return { data: rows.map(mapTagRow), total, page, limit }
  }

  async create(
    schemaName: string,
    data: { name: string; color?: string; entityType: TagEntityType },
  ): Promise<Tag> {
    const row = await this.tagsRepository.create(schemaName, data)
    return mapTagRow(row)
  }

  async update(
    schemaName: string,
    tagId: string,
    data: { name?: string; color?: string },
  ): Promise<Tag> {
    const row = await this.tagsRepository.update(schemaName, tagId, data)
    return mapTagRow(row)
  }

  async remove(schemaName: string, tagId: string): Promise<void> {
    return this.tagsRepository.remove(schemaName, tagId)
  }

  async restore(schemaName: string, tagId: string): Promise<Tag> {
    const row = await this.tagsRepository.restore(schemaName, tagId)
    return mapTagRow(row)
  }
}
