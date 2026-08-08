import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { Tag, TagEntityType } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { TagRow } from './interfaces/tag-row.interfaces'

const TAG_COLUMNS = 'id, name, color, entity_type, created_at'

@Injectable()
export class TagsService {
  constructor(private readonly db: TenantDbService) {}

  async findAll(schemaName: string, entityType?: TagEntityType): Promise<Tag[]> {
    return this.db.query(schemaName, async (qr): Promise<Tag[]> => {
      const params: unknown[] = []
      let where = ''

      if (entityType) {
        params.push(entityType)
        where = ` WHERE entity_type = $1`
      }

      const rows: TagRow[] = await qr.query(
        `SELECT ${TAG_COLUMNS} FROM tags${where} ORDER BY entity_type, name`,
        params,
      )

      return rows.map((r) => this.map(r))
    })
  }

  async create(
    schemaName: string,
    data: { name: string; color?: string; entityType: TagEntityType },
  ): Promise<Tag> {
    return this.db.query(schemaName, async (qr): Promise<Tag> => {
      const existing: TagRow[] = await qr.query(
        `SELECT id FROM tags WHERE entity_type = $1 AND LOWER(name) = LOWER($2)`,
        [data.entityType, data.name],
      )
      if (existing.length > 0) {
        throw new BadRequestException(`Tag "${data.name}" already exists for ${data.entityType}`)
      }

      const rows: TagRow[] = await qr.query(
        `INSERT INTO tags (name, color, entity_type) VALUES ($1, $2, $3) RETURNING ${TAG_COLUMNS}`,
        [data.name, data.color ?? '#6B7280', data.entityType],
      )

      return this.map(rows[0]!)
    })
  }

  async update(
    schemaName: string,
    tagId: string,
    data: { name?: string; color?: string },
  ): Promise<Tag> {
    return this.db.query(schemaName, async (qr): Promise<Tag> => {
      const sets: string[] = []
      const params: unknown[] = []

      if (data.name) {
        params.push(data.name)
        sets.push(`name = $${params.length}`)
      }
      if (data.color) {
        params.push(data.color)
        sets.push(`color = $${params.length}`)
      }

      if (sets.length === 0) {
        const rows: TagRow[] = await qr.query(`SELECT ${TAG_COLUMNS} FROM tags WHERE id = $1`, [
          tagId,
        ])
        if (!rows[0]) throw new NotFoundException(`Tag ${tagId} not found`)
        return this.map(rows[0])
      }

      params.push(tagId)
      const result: unknown = await qr.query(
        `UPDATE tags SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING ${TAG_COLUMNS}`,
        params,
      )

      const row = firstReturnedRow<TagRow>(result)
      if (!row) throw new NotFoundException(`Tag ${tagId} not found`)
      return this.map(row)
    })
  }

  async remove(schemaName: string, tagId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      const result: unknown = await qr.query(`DELETE FROM tags WHERE id = $1 RETURNING name`, [
        tagId,
      ])
      const row = firstReturnedRow<{ name: string }>(result)
      if (!row) throw new NotFoundException(`Tag ${tagId} not found`)

      await qr.query(`UPDATE contacts SET tags = array_remove(tags, $1) WHERE $1 = ANY(tags)`, [
        row.name,
      ])
    })
  }

  private map(r: TagRow): Tag {
    return {
      id: r.id,
      name: r.name,
      color: r.color,
      entityType: r.entity_type,
      createdAt: r.created_at,
    }
  }
}

function firstReturnedRow<T>(result: unknown): T | undefined {
  if (!Array.isArray(result)) return undefined
  const [head] = result as unknown[]
  return (Array.isArray(head) ? (head[0] as T | undefined) : (head as T | undefined)) ?? undefined
}
