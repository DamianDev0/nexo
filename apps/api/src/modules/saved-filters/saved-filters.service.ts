import { Injectable, NotFoundException } from '@nestjs/common'
import type { SavedFilter } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'

interface FilterRow {
  id: string
  user_id: string
  entity_type: string
  name: string
  filters: Record<string, unknown>
  is_default: boolean
  position: number
  created_at: string
  updated_at: string
}

@Injectable()
export class SavedFiltersService {
  constructor(private readonly db: TenantDbService) {}

  async findAll(schemaName: string, userId: string, entityType?: string): Promise<SavedFilter[]> {
    return this.db.query(schemaName, async (qr): Promise<SavedFilter[]> => {
      const params: unknown[] = [userId]
      let entityFilter = ''
      if (entityType) {
        params.push(entityType)
        entityFilter = ` AND entity_type = $${params.length}`
      }

      const rows: FilterRow[] = await qr.query(
        `SELECT * FROM saved_filters WHERE user_id = $1${entityFilter} ORDER BY position ASC, name ASC`,
        params,
      )
      return rows.map((r) => this.map(r))
    })
  }

  async create(
    schemaName: string,
    userId: string,
    data: {
      entityType: string
      name: string
      filters: Record<string, unknown>
      isDefault?: boolean
    },
  ): Promise<SavedFilter> {
    return this.db.query(schemaName, async (qr): Promise<SavedFilter> => {
      if (data.isDefault) {
        await qr.query(
          `UPDATE saved_filters SET is_default = false WHERE user_id = $1 AND entity_type = $2`,
          [userId, data.entityType],
        )
      }

      const rows: FilterRow[] = await qr.query(
        `INSERT INTO saved_filters (user_id, entity_type, name, filters, is_default)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [userId, data.entityType, data.name, data.filters, data.isDefault ?? false],
      )
      return this.map(rows[0]!)
    })
  }

  async update(
    schemaName: string,
    filterId: string,
    userId: string,
    data: Partial<{
      name: string
      filters: Record<string, unknown>
      isDefault: boolean
    }>,
  ): Promise<SavedFilter> {
    return this.db.query(schemaName, async (qr): Promise<SavedFilter> => {
      const sets: string[] = ['updated_at = NOW()']
      const params: unknown[] = []

      if (data.name) {
        params.push(data.name)
        sets.push(`name = $${params.length}`)
      }
      if (data.filters) {
        params.push(data.filters)
        sets.push(`filters = $${params.length}`)
      }
      if (data.isDefault !== undefined) {
        params.push(data.isDefault)
        sets.push(`is_default = $${params.length}`)
      }

      params.push(filterId, userId)
      const rows: FilterRow[] = await qr.query(
        `UPDATE saved_filters SET ${sets.join(', ')} WHERE id = $${params.length - 1} AND user_id = $${params.length} RETURNING *`,
        params,
      )
      if (!rows[0]) throw new NotFoundException(`Filter ${filterId} not found`)
      return this.map(rows[0])
    })
  }

  async remove(schemaName: string, filterId: string, userId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      const rows: FilterRow[] = await qr.query(
        `DELETE FROM saved_filters WHERE id = $1 AND user_id = $2 RETURNING id`,
        [filterId, userId],
      )
      if (rows.length === 0) throw new NotFoundException(`Filter ${filterId} not found`)
    })
  }

  private map(r: FilterRow): SavedFilter {
    return {
      id: r.id,
      userId: r.user_id,
      entityType: r.entity_type as SavedFilter['entityType'],
      name: r.name,
      filters: r.filters,
      isDefault: r.is_default,
      position: r.position,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  }
}
