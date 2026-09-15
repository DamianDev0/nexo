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

const VIEW_COLUMNS = `id, owner_id, name, description, filters, advanced_filters, columns, sort,
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

  async lockOwner(qr: QueryRunner, userId: string): Promise<void> {
    await qr.query(`SELECT pg_advisory_xact_lock(hashtext('contact_views'), hashtext($1))`, [
      userId,
    ])
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

  async insert(qr: QueryRunner, data: ContactViewInsertData): Promise<ContactViewRow | null> {
    const rows = await sqlRows<ContactViewRow[]>(
      qr,
      `INSERT INTO contact_views
         (owner_id, name, description, filters, advanced_filters, columns, sort, density,
          is_default, is_favorite, visibility, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING ${VIEW_COLUMNS}`,
      [
        data.ownerId,
        data.name,
        data.description,
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
    return rows[0] ?? null
  }

  async insertCopy(qr: QueryRunner, data: ContactViewCopyData): Promise<ContactViewRow | null> {
    const rows = await sqlRows<ContactViewRow[]>(
      qr,
      `INSERT INTO contact_views
         (owner_id, name, description, filters, advanced_filters, columns, sort, density,
          is_default, is_favorite, visibility, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, false, 'private', $9)
       RETURNING ${VIEW_COLUMNS}`,
      [
        data.ownerId,
        data.name,
        data.description,
        data.filters,
        data.advancedFilters,
        data.columns,
        data.sort,
        data.density,
        data.position,
      ],
    )
    return rows[0] ?? null
  }

  async updateOwned(
    qr: QueryRunner,
    viewId: string,
    userId: string,
    data: ContactViewUpdateData,
  ): Promise<ContactViewRow | null> {
    const rows = await sqlRows<ContactViewRow[]>(
      qr,
      `UPDATE contact_views SET
         name = $3, description = $4, filters = $5, advanced_filters = $6, columns = $7, sort = $8,
         density = $9, is_default = $10, is_favorite = $11, visibility = $12,
         updated_at = NOW()
       WHERE id = $1 AND owner_id = $2
       RETURNING ${VIEW_COLUMNS}`,
      [
        viewId,
        userId,
        data.name,
        data.description,
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
    return rows[0] ?? null
  }

  async reorderOwned(schemaName: string, userId: string, ids: string[]): Promise<number> {
    return this.db.transactional(schemaName, async (qr): Promise<number> => {
      await this.lockOwner(qr, userId)
      const rows = await sqlRows<Array<{ id: string }>>(
        qr,
        `UPDATE contact_views AS v
         SET position = ordered.position, updated_at = NOW()
         FROM unnest($1::uuid[]) WITH ORDINALITY AS ordered(id, position)
         WHERE v.id = ordered.id AND v.owner_id = $2
         RETURNING v.id`,
        [ids, userId],
      )
      return rows.length
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
