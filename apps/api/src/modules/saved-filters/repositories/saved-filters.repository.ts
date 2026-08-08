import { Injectable, NotFoundException } from '@nestjs/common'
import type { SavedFilterEntityType } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  CreateSavedFilterData,
  FilterRow,
  UpdateSavedFilterData,
} from '../interfaces/saved-filter-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class SavedFiltersRepository {
  constructor(private readonly db: TenantDbService) {}

  async findAllByUser(
    schemaName: string,
    userId: string,
    entityType?: SavedFilterEntityType,
  ): Promise<FilterRow[]> {
    return this.db.query(schemaName, async (qr): Promise<FilterRow[]> => {
      const params: unknown[] = [userId]
      let entityFilter = ''
      if (entityType) {
        params.push(entityType)
        entityFilter = ` AND entity_type = $${params.length}`
      }

      const rows = await sqlRows<FilterRow[]>(
        qr,
        `SELECT * FROM saved_filters WHERE user_id = $1${entityFilter} ORDER BY position ASC, name ASC`,
        params,
      )
      return rows
    })
  }

  async insert(
    schemaName: string,
    userId: string,
    data: CreateSavedFilterData,
  ): Promise<FilterRow> {
    return this.db.query(schemaName, async (qr): Promise<FilterRow> => {
      if (data.isDefault) {
        await qr.query(
          `UPDATE saved_filters SET is_default = false WHERE user_id = $1 AND entity_type = $2`,
          [userId, data.entityType],
        )
      }

      const rows = await sqlRows<FilterRow[]>(
        qr,
        `INSERT INTO saved_filters (user_id, entity_type, name, filters, is_default)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [userId, data.entityType, data.name, data.filters, data.isDefault ?? false],
      )
      return rows[0]!
    })
  }

  async updateById(
    schemaName: string,
    filterId: string,
    userId: string,
    data: UpdateSavedFilterData,
  ): Promise<FilterRow | null> {
    return this.db.query(schemaName, async (qr): Promise<FilterRow | null> => {
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
      const rows = await sqlRows<FilterRow[]>(
        qr,
        `UPDATE saved_filters SET ${sets.join(', ')} WHERE id = $${params.length - 1} AND user_id = $${params.length} RETURNING *`,
        params,
      )
      return rows[0] ?? null
    })
  }

  async deleteById(schemaName: string, filterId: string, userId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      const rows = await sqlRows<FilterRow[]>(
        qr,
        `SELECT id FROM saved_filters WHERE id = $1 AND user_id = $2`,
        [filterId, userId],
      )
      if (rows.length === 0) throw new NotFoundException(`Filter ${filterId} not found`)
      await qr.query(`DELETE FROM saved_filters WHERE id = $1 AND user_id = $2`, [filterId, userId])
    })
  }
}
