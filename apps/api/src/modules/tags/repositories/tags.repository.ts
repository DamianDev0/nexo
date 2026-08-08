import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { TagEntityType } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { TagRow } from '../interfaces/tag-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

const TAG_COLUMNS = 'id, name, color, entity_type, created_at'

@Injectable()
export class TagsRepository {
  constructor(private readonly db: TenantDbService) {}

  async findAll(schemaName: string, entityType?: TagEntityType): Promise<TagRow[]> {
    return this.db.query(schemaName, async (qr): Promise<TagRow[]> => {
      const params: unknown[] = []
      let where = ''

      if (entityType) {
        params.push(entityType)
        where = ` WHERE entity_type = $1`
      }

      const rows = await sqlRows<TagRow[]>(
        qr,
        `SELECT ${TAG_COLUMNS} FROM tags${where} ORDER BY entity_type, name`,
        params,
      )

      return rows
    })
  }

  async create(
    schemaName: string,
    data: { name: string; color?: string; entityType: TagEntityType },
  ): Promise<TagRow> {
    return this.db.query(schemaName, async (qr): Promise<TagRow> => {
      const existing = await sqlRows<TagRow[]>(
        qr,
        `SELECT id FROM tags WHERE entity_type = $1 AND LOWER(name) = LOWER($2)`,
        [data.entityType, data.name],
      )
      if (existing.length > 0) {
        throw new BadRequestException(`Tag "${data.name}" already exists for ${data.entityType}`)
      }

      const rows = await sqlRows<TagRow[]>(
        qr,
        `INSERT INTO tags (name, color, entity_type) VALUES ($1, $2, $3) RETURNING ${TAG_COLUMNS}`,
        [data.name, data.color ?? '#6B7280', data.entityType],
      )

      return rows[0]!
    })
  }

  async update(
    schemaName: string,
    tagId: string,
    data: { name?: string; color?: string },
  ): Promise<TagRow> {
    return this.db.query(schemaName, async (qr): Promise<TagRow> => {
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
        const rows = await sqlRows<TagRow[]>(qr, `SELECT ${TAG_COLUMNS} FROM tags WHERE id = $1`, [
          tagId,
        ])
        if (!rows[0]) throw new NotFoundException(`Tag ${tagId} not found`)
        return rows[0]
      }

      params.push(tagId)
      const result = await sqlRows<unknown>(
        qr,
        `UPDATE tags SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING ${TAG_COLUMNS}`,
        params,
      )

      const row = firstReturnedRow<TagRow>(result)
      if (!row) throw new NotFoundException(`Tag ${tagId} not found`)
      return row
    })
  }

  async remove(schemaName: string, tagId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      const result = await sqlRows<unknown>(qr, `DELETE FROM tags WHERE id = $1 RETURNING name`, [
        tagId,
      ])
      const row = firstReturnedRow<{ name: string }>(result)
      if (!row) throw new NotFoundException(`Tag ${tagId} not found`)

      await qr.query(`UPDATE contacts SET tags = array_remove(tags, $1) WHERE $1 = ANY(tags)`, [
        row.name,
      ])
    })
  }
}

function firstReturnedRow<T>(result: unknown): T | undefined {
  if (!Array.isArray(result)) return undefined
  const [head] = result as unknown[]
  return (Array.isArray(head) ? (head[0] as T | undefined) : (head as T | undefined)) ?? undefined
}
