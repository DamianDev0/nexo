import { Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import type { ObjectType } from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { sqlRows } from '@/shared/database/sql.util'
import type {
  ObjectViewCopyData,
  ObjectViewInsertData,
  ObjectViewRow,
  ObjectViewUpdateData,
} from '../interfaces/object-view-row.interfaces'

const VIEW_COLUMNS = `id, owner_id, name, description, filters, advanced_filters, columns, sort,
  density, is_default, is_favorite, visibility, position, created_at, updated_at`

@Injectable()
export class ObjectViewsRepository {
  constructor(private readonly db: TenantDbService) {}

  async findAllVisible(
    schemaName: string,
    objectType: ObjectType,
    userId: string,
  ): Promise<ObjectViewRow[]> {
    return this.db.query(schemaName, async (qr): Promise<ObjectViewRow[]> => {
      const rows = await sqlRows<ObjectViewRow[]>(
        qr,
        `SELECT ${VIEW_COLUMNS} FROM object_views
         WHERE object_type = $1 AND (owner_id = $2 OR visibility = 'shared')
         ORDER BY position ASC, created_at ASC`,
        [objectType, userId],
      )
      return rows
    })
  }

  async findById(
    qr: QueryRunner,
    objectType: ObjectType,
    viewId: string,
  ): Promise<ObjectViewRow | null> {
    const rows = await sqlRows<ObjectViewRow[]>(
      qr,
      `SELECT ${VIEW_COLUMNS} FROM object_views WHERE id = $1 AND object_type = $2`,
      [viewId, objectType],
    )
    return rows[0] ?? null
  }

  async findVisibleById(
    qr: QueryRunner,
    objectType: ObjectType,
    viewId: string,
    userId: string,
  ): Promise<ObjectViewRow | null> {
    const rows = await sqlRows<ObjectViewRow[]>(
      qr,
      `SELECT ${VIEW_COLUMNS} FROM object_views
       WHERE id = $1 AND object_type = $2 AND (owner_id = $3 OR visibility = 'shared')`,
      [viewId, objectType, userId],
    )
    return rows[0] ?? null
  }

  async lockOwner(qr: QueryRunner, objectType: ObjectType, userId: string): Promise<void> {
    await qr.query(`SELECT pg_advisory_xact_lock(hashtext('object_views:' || $1), hashtext($2))`, [
      objectType,
      userId,
    ])
  }

  async clearDefault(qr: QueryRunner, objectType: ObjectType, userId: string): Promise<void> {
    await qr.query(
      `UPDATE object_views SET is_default = false WHERE owner_id = $1 AND object_type = $2`,
      [userId, objectType],
    )
  }

  async nextPosition(qr: QueryRunner, objectType: ObjectType, userId: string): Promise<number> {
    const positionRows = await sqlRows<[{ next: number }]>(
      qr,
      `SELECT COALESCE(MAX(position), -1) + 1 AS next FROM object_views
       WHERE owner_id = $1 AND object_type = $2`,
      [userId, objectType],
    )
    return positionRows[0].next
  }

  async insert(qr: QueryRunner, data: ObjectViewInsertData): Promise<ObjectViewRow | null> {
    const rows = await sqlRows<ObjectViewRow[]>(
      qr,
      `INSERT INTO object_views
         (object_type, owner_id, name, description, filters, advanced_filters, columns, sort,
          density, is_default, is_favorite, visibility, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING ${VIEW_COLUMNS}`,
      [
        data.objectType,
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

  async insertCopy(qr: QueryRunner, data: ObjectViewCopyData): Promise<ObjectViewRow | null> {
    const rows = await sqlRows<ObjectViewRow[]>(
      qr,
      `INSERT INTO object_views
         (object_type, owner_id, name, description, filters, advanced_filters, columns, sort,
          density, is_default, is_favorite, visibility, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, false, 'private', $10)
       RETURNING ${VIEW_COLUMNS}`,
      [
        data.objectType,
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
    objectType: ObjectType,
    viewId: string,
    userId: string,
    data: ObjectViewUpdateData,
  ): Promise<ObjectViewRow | null> {
    const rows = await sqlRows<ObjectViewRow[]>(
      qr,
      `UPDATE object_views SET
         name = $3, description = $4, filters = $5, advanced_filters = $6, columns = $7, sort = $8,
         density = $9, is_default = $10, is_favorite = $11, visibility = $12,
         updated_at = NOW()
       WHERE id = $1 AND owner_id = $2 AND object_type = $13
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
        objectType,
      ],
    )
    return rows[0] ?? null
  }

  async reorderOwned(
    schemaName: string,
    objectType: ObjectType,
    userId: string,
    ids: string[],
  ): Promise<number> {
    return this.db.transactional(schemaName, async (qr): Promise<number> => {
      await this.lockOwner(qr, objectType, userId)
      const rows = await sqlRows<Array<{ id: string }>>(
        qr,
        `UPDATE object_views AS v
         SET position = ordered.position, updated_at = NOW()
         FROM unnest($1::uuid[]) WITH ORDINALITY AS ordered(id, position)
         WHERE v.id = ordered.id AND v.owner_id = $2 AND v.object_type = $3
         RETURNING v.id`,
        [ids, userId, objectType],
      )
      return rows.length
    })
  }

  async deleteOwned(
    schemaName: string,
    objectType: ObjectType,
    viewId: string,
    userId: string,
  ): Promise<boolean> {
    return this.db.query(schemaName, async (qr): Promise<boolean> => {
      const rows = await sqlRows<Array<{ id: string }>>(
        qr,
        `DELETE FROM object_views
         WHERE id = $1 AND owner_id = $2 AND object_type = $3
         RETURNING id`,
        [viewId, userId, objectType],
      )
      return rows.length > 0
    })
  }
}
