import { Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  ContactViewCopyData,
  ContactViewInsertData,
  ContactViewRow,
  ContactViewUpdateData,
} from '../interfaces/contact-view-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

const VIEW_COLUMNS = `id, owner_id, name, filters, advanced_filters, columns, sort,
  density, is_default, is_favorite, visibility, position, created_at, updated_at`

@Injectable()
export class ContactViewsRepository {
  constructor(private readonly db: TenantDbService) {}

  async findAllVisible(schemaName: string, userId: string): Promise<ContactViewRow[]> {
    return this.db.query(schemaName, async (qr): Promise<ContactViewRow[]> => {
      const rows = await sqlRows<ContactViewRow[]>(
        qr,
        `SELECT ${VIEW_COLUMNS} FROM contact_views
         WHERE owner_id = $1 OR visibility = 'shared'
         ORDER BY position ASC, created_at ASC`,
        [userId],
      )
      return rows
    })
  }

  async findById(qr: QueryRunner, viewId: string): Promise<ContactViewRow | null> {
    const rows = await sqlRows<ContactViewRow[]>(
      qr,
      `SELECT ${VIEW_COLUMNS} FROM contact_views WHERE id = $1`,
      [viewId],
    )
    return rows[0] ?? null
  }

  async findVisibleById(
    qr: QueryRunner,
    viewId: string,
    userId: string,
  ): Promise<ContactViewRow | null> {
    const rows = await sqlRows<ContactViewRow[]>(
      qr,
      `SELECT ${VIEW_COLUMNS} FROM contact_views
       WHERE id = $1 AND (owner_id = $2 OR visibility = 'shared')`,
      [viewId, userId],
    )
    return rows[0] ?? null
  }

  async clearDefault(qr: QueryRunner, userId: string): Promise<void> {
    await qr.query(`UPDATE contact_views SET is_default = false WHERE owner_id = $1`, [userId])
  }

  async nextPosition(qr: QueryRunner, userId: string): Promise<number> {
    const positionRows = await sqlRows<[{ next: number }]>(
      qr,
      `SELECT COALESCE(MAX(position), -1) + 1 AS next FROM contact_views WHERE owner_id = $1`,
      [userId],
    )
    return positionRows[0].next
  }

  async insert(qr: QueryRunner, data: ContactViewInsertData): Promise<ContactViewRow> {
    const rows = await sqlRows<ContactViewRow[]>(
      qr,
      `INSERT INTO contact_views
         (owner_id, name, filters, advanced_filters, columns, sort, density,
          is_default, is_favorite, visibility, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${VIEW_COLUMNS}`,
      [
        data.ownerId,
        data.name,
        data.filters,
        data.advancedFilters,
        data.columns,
        data.sort,
        data.density,
        data.isDefault,
        data.isFavorite,
        data.visibility,
        data.position,
      ],
    )
    return rows[0]!
  }

  async insertCopy(qr: QueryRunner, data: ContactViewCopyData): Promise<ContactViewRow> {
    const rows = await sqlRows<ContactViewRow[]>(
      qr,
      `INSERT INTO contact_views
         (owner_id, name, filters, advanced_filters, columns, sort, density,
          is_default, is_favorite, visibility, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, false, 'private', $8)
       RETURNING ${VIEW_COLUMNS}`,
      [
        data.ownerId,
        data.name,
        data.filters,
        data.advancedFilters,
        data.columns,
        data.sort,
        data.density,
        data.position,
      ],
    )
    return rows[0]!
  }

  async updateOwned(
    qr: QueryRunner,
    viewId: string,
    userId: string,
    data: ContactViewUpdateData,
  ): Promise<ContactViewRow> {
    const rows = await sqlRows<ContactViewRow[]>(
      qr,
      `UPDATE contact_views SET
         name = $3, filters = $4, advanced_filters = $5, columns = $6, sort = $7,
         density = $8, is_default = $9, is_favorite = $10, visibility = $11,
         updated_at = NOW()
       WHERE id = $1 AND owner_id = $2
       RETURNING ${VIEW_COLUMNS}`,
      [
        viewId,
        userId,
        data.name,
        data.filters,
        data.advancedFilters,
        data.columns,
        data.sort,
        data.density,
        data.isDefault,
        data.isFavorite,
        data.visibility,
      ],
    )
    return rows[0]!
  }

  async reorderOwned(schemaName: string, userId: string, ids: string[]): Promise<void> {
    await this.db.transactional(schemaName, async (qr) => {
      await Promise.all(
        ids.map((id, index) =>
          qr.query(
            `UPDATE contact_views SET position = $3, updated_at = NOW()
             WHERE id = $1 AND owner_id = $2`,
            [id, userId, index],
          ),
        ),
      )
    })
  }

  async deleteOwned(schemaName: string, viewId: string, userId: string): Promise<boolean> {
    return this.db.query(schemaName, async (qr): Promise<boolean> => {
      const rows = await sqlRows<Array<{ id: string }>>(
        qr,
        `SELECT id FROM contact_views WHERE id = $1 AND owner_id = $2`,
        [viewId, userId],
      )
      if (rows.length === 0) return false
      await qr.query(`DELETE FROM contact_views WHERE id = $1 AND owner_id = $2`, [viewId, userId])
      return true
    })
  }
}
