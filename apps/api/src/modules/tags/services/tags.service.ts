import { Injectable } from '@nestjs/common'
import type { Tag, TagEntityType } from '@repo/shared-types'
import { TagsRepository } from '../repositories/tags.repository'
import { mapTagRow } from '../mappers/tag.mapper'

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepository: TagsRepository) {}

  async findAll(schemaName: string, entityType?: TagEntityType): Promise<Tag[]> {
    const rows = await this.tagsRepository.findAll(schemaName, entityType)
    return rows.map(mapTagRow)
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
}
