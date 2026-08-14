import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { TagEntityType } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { TagRow } from '../interfaces/tag-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

const TAG_COLUMNS = 'id, name, color, description, enabled, entity_type, created_at'

@Injectable()
export class TagsRepository {
  constructor(private readonly db: TenantDbService) {}

  async findPage(
    schemaName: string,
    query: { entityType?: TagEntityType; page: number; limit: number },
  ): Promise<{ rows: TagRow[]; total: number }> {
    return this.db.query(schemaName, async (qr): Promise<{ rows: TagRow[]; total: number }> => {
      const whereParams: unknown[] = query.entityType ? [query.entityType] : []
      const where = query.entityType ? ` WHERE entity_type = $1` : ''

      const countRows = await sqlRows<Array<{ count: string }>>(
        qr,
        `SELECT COUNT(*)::text AS count FROM tags${where}`,
        whereParams,
      )
      const total = Number.parseInt(countRows[0]?.count ?? '0', 10)

      const pageParams = [...whereParams, query.limit, (query.page - 1) * query.limit]
      const rows = await sqlRows<TagRow[]>(
        qr,
        `SELECT ${TAG_COLUMNS} FROM tags${where} ORDER BY entity_type, name LIMIT $${pageParams.length - 1} OFFSET $${pageParams.length}`,
        pageParams,
      )

      return { rows, total }
    })
  }

  async create(
    schemaName: string,
    data: { name: string; color?: string; description?: string; entityType: TagEntityType },
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
        `INSERT INTO tags (name, color, description, entity_type) VALUES ($1, $2, $3, $4) RETURNING ${TAG_COLUMNS}`,
        [data.name, data.color ?? '#9CA3AF', data.description ?? null, data.entityType],
      )

      return rows[0]!
    })
  }

  async update(
    schemaName: string,
    tagId: string,
    data: { name?: string; color?: string; description?: string | null; enabled?: boolean },
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
      if (data.description !== undefined) {
        params.push(data.description)
        sets.push(`description = $${params.length}`)
      }
      if (data.enabled !== undefined) {
        params.push(data.enabled)
        sets.push(`enabled = $${params.length}`)
      }

      if (sets.length === 0) {
        const rows = await sqlRows<TagRow[]>(qr, `SELECT ${TAG_COLUMNS} FROM tags WHERE id = $1`, [
          tagId,
        ])
        if (!rows[0]) throw new NotFoundException(`Tag ${tagId} not found`)
        return rows[0]
      }

      let previousName: string | null = null
      if (data.name) {
        const previous = await sqlRows<Array<{ name: string }>>(
          qr,
          `SELECT name FROM tags WHERE id = $1`,
          [tagId],
        )
        if (!previous[0]) throw new NotFoundException(`Tag ${tagId} not found`)
        previousName = previous[0].name
      }

      params.push(tagId)
      const result = await sqlRows<unknown>(
        qr,
        `UPDATE tags SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING ${TAG_COLUMNS}`,
        params,
      )

      const row = firstReturnedRow<TagRow>(result)
      if (!row) throw new NotFoundException(`Tag ${tagId} not found`)

      if (data.name && previousName && data.name !== previousName) {
        await qr.query(
          `UPDATE contacts SET tags = array_replace(tags, $1, $2) WHERE $1 = ANY(tags)`,
          [previousName, data.name],
        )
      }

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
