import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { ContactView } from '@repo/shared-types'
import type {
  CreateContactViewDto,
  DuplicateContactViewDto,
  ReorderContactViewsDto,
  UpdateContactViewDto,
} from '../dto/contact-view.dto'
import type { ContactViewRow } from '../interfaces/contact-view-row.interfaces'

const VIEW_COLUMNS = `id, owner_id, name, filters, advanced_filters, columns, sort,
  density, is_default, is_favorite, visibility, position, created_at, updated_at`

@Injectable()
export class ContactViewsService {
  constructor(private readonly db: TenantDbService) {}

  async findAll(schemaName: string, userId: string): Promise<ContactView[]> {
    return this.db.query(schemaName, async (qr): Promise<ContactView[]> => {
      const rows: ContactViewRow[] = await qr.query(
        `SELECT ${VIEW_COLUMNS} FROM contact_views
         WHERE owner_id = $1 OR visibility = 'shared'
         ORDER BY position ASC, created_at ASC`,
        [userId],
      )
      return rows.map((r) => this.map(r))
    })
  }

  async create(
    schemaName: string,
    userId: string,
    dto: CreateContactViewDto,
  ): Promise<ContactView> {
    return this.db.transactional(schemaName, async (qr): Promise<ContactView> => {
      if (dto.isDefault) await this.clearDefault(qr, userId)
      const positionRows: [{ next: number }] = await qr.query(
        `SELECT COALESCE(MAX(position), -1) + 1 AS next FROM contact_views WHERE owner_id = $1`,
        [userId],
      )
      const rows: ContactViewRow[] = await qr.query(
        `INSERT INTO contact_views
           (owner_id, name, filters, advanced_filters, columns, sort, density,
            is_default, is_favorite, visibility, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING ${VIEW_COLUMNS}`,
        [
          userId,
          dto.name,
          dto.filters ?? {},
          dto.advancedFilters ?? null,
          dto.columns ?? {},
          dto.sort ?? null,
          dto.density ?? 'comfortable',
          dto.isDefault ?? false,
          dto.isFavorite ?? false,
          dto.visibility ?? 'private',
          positionRows[0].next,
        ],
      )
      return this.map(rows[0]!)
    })
  }

  async update(
    schemaName: string,
    userId: string,
    viewId: string,
    dto: UpdateContactViewDto,
  ): Promise<ContactView> {
    return this.db.transactional(schemaName, async (qr): Promise<ContactView> => {
      const existing = await this.fetchOwnedOrFail(qr, userId, viewId)
      if (dto.isDefault) await this.clearDefault(qr, userId)
      const rows: ContactViewRow[] = await qr.query(
        `UPDATE contact_views SET
           name = $3, filters = $4, advanced_filters = $5, columns = $6, sort = $7,
           density = $8, is_default = $9, is_favorite = $10, visibility = $11,
           updated_at = NOW()
         WHERE id = $1 AND owner_id = $2
         RETURNING ${VIEW_COLUMNS}`,
        [
          viewId,
          userId,
          dto.name ?? existing.name,
          dto.filters ?? existing.filters,
          dto.advancedFilters ?? existing.advanced_filters,
          dto.columns ?? existing.columns,
          dto.sort ?? existing.sort,
          dto.density ?? existing.density,
          dto.isDefault ?? existing.is_default,
          dto.isFavorite ?? existing.is_favorite,
          dto.visibility ?? existing.visibility,
        ],
      )
      return this.map(rows[0]!)
    })
  }

  async duplicate(
    schemaName: string,
    userId: string,
    viewId: string,
    dto: DuplicateContactViewDto,
  ): Promise<ContactView> {
    return this.db.transactional(schemaName, async (qr): Promise<ContactView> => {
      const source = await this.fetchVisibleOrFail(qr, userId, viewId)
      const positionRows: [{ next: number }] = await qr.query(
        `SELECT COALESCE(MAX(position), -1) + 1 AS next FROM contact_views WHERE owner_id = $1`,
        [userId],
      )
      const rows: ContactViewRow[] = await qr.query(
        `INSERT INTO contact_views
           (owner_id, name, filters, advanced_filters, columns, sort, density,
            is_default, is_favorite, visibility, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, false, false, 'private', $8)
         RETURNING ${VIEW_COLUMNS}`,
        [
          userId,
          dto.name ?? `${source.name} (copy)`,
          source.filters,
          source.advanced_filters,
          source.columns,
          source.sort,
          source.density,
          positionRows[0].next,
        ],
      )
      return this.map(rows[0]!)
    })
  }

  async reorder(schemaName: string, userId: string, dto: ReorderContactViewsDto): Promise<void> {
    await this.db.transactional(schemaName, async (qr) => {
      await Promise.all(
        dto.ids.map((id, index) =>
          qr.query(
            `UPDATE contact_views SET position = $3, updated_at = NOW()
             WHERE id = $1 AND owner_id = $2`,
            [id, userId, index],
          ),
        ),
      )
    })
  }

  async remove(schemaName: string, userId: string, viewId: string): Promise<void> {
    await this.db.query(schemaName, async (qr) => {
      const rows: Array<{ id: string }> = await qr.query(
        `SELECT id FROM contact_views WHERE id = $1 AND owner_id = $2`,
        [viewId, userId],
      )
      if (rows.length === 0) throw new NotFoundException(`Contact view ${viewId} not found`)
      await qr.query(`DELETE FROM contact_views WHERE id = $1 AND owner_id = $2`, [viewId, userId])
    })
  }

  private async clearDefault(qr: QueryRunner, userId: string): Promise<void> {
    await qr.query(`UPDATE contact_views SET is_default = false WHERE owner_id = $1`, [userId])
  }

  private async fetchOwnedOrFail(
    qr: QueryRunner,
    userId: string,
    viewId: string,
  ): Promise<ContactViewRow> {
    const rows: ContactViewRow[] = await qr.query(
      `SELECT ${VIEW_COLUMNS} FROM contact_views WHERE id = $1`,
      [viewId],
    )
    const row = rows[0]
    if (!row) throw new NotFoundException(`Contact view ${viewId} not found`)
    if (row.owner_id !== userId) throw new ForbiddenException('Only the owner can modify this view')
    return row
  }

  private async fetchVisibleOrFail(
    qr: QueryRunner,
    userId: string,
    viewId: string,
  ): Promise<ContactViewRow> {
    const rows: ContactViewRow[] = await qr.query(
      `SELECT ${VIEW_COLUMNS} FROM contact_views
       WHERE id = $1 AND (owner_id = $2 OR visibility = 'shared')`,
      [viewId, userId],
    )
    const row = rows[0]
    if (!row) throw new NotFoundException(`Contact view ${viewId} not found`)
    return row
  }

  private map(r: ContactViewRow): ContactView {
    return {
      id: r.id,
      ownerId: r.owner_id,
      name: r.name,
      filters: r.filters ?? {},
      advancedFilters: r.advanced_filters,
      columns: (r.columns ?? {}) as ContactView['columns'],
      sort: r.sort,
      density: r.density as ContactView['density'],
      isDefault: r.is_default,
      isFavorite: r.is_favorite,
      visibility: r.visibility as ContactView['visibility'],
      position: r.position,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  }
}
