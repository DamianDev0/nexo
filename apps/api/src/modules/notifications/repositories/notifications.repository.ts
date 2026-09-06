import { Injectable } from '@nestjs/common'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  NotificationListResult,
  NotificationRow,
  PreferencesRow,
} from '../interfaces/notification-row.interfaces'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class NotificationsRepository {
  constructor(private readonly db: TenantDbService) {}

  async findAll(
    schemaName: string,
    userId: string,
    filters: { unreadOnly: boolean; notificationType?: string; limit: number; offset: number },
  ): Promise<NotificationListResult> {
    return this.db.query(schemaName, async (qr): Promise<NotificationListResult> => {
      const conditions: string[] = ['user_id = $1']
      const params: unknown[] = [userId]

      if (filters.unreadOnly) {
        conditions.push('is_read = false')
      }

      if (filters.notificationType) {
        params.push(filters.notificationType)
        conditions.push(`notification_type = $${params.length}`)
      }

      const where = conditions.join(' AND ')

      const countRows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM notifications WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const unreadRows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
        [userId],
      )
      const unreadCount = Number.parseInt(unreadRows[0].count, 10)

      const dataParams = [...params, filters.limit, filters.offset]
      const rows = await sqlRows<NotificationRow[]>(
        qr,
        `SELECT * FROM notifications
         WHERE ${where}
         ORDER BY created_at DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return { rows, total, unreadCount }
    })
  }

  async getUnreadCount(schemaName: string, userId: string): Promise<number> {
    return this.db.query(schemaName, async (qr): Promise<number> => {
      const rows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
        [userId],
      )
      return Number.parseInt(rows[0].count, 10)
    })
  }

  async markAsRead(schemaName: string, notificationId: string, userId: string): Promise<number> {
    return this.db.query(schemaName, async (qr): Promise<number> => {
      const result = await sqlRows<NotificationRow[]>(
        qr,
        `UPDATE notifications SET is_read = true, read_at = NOW()
         WHERE id = $1 AND user_id = $2 AND is_read = false
         RETURNING id`,
        [notificationId, userId],
      )
      return result.length
    })
  }

  async markAllAsRead(schemaName: string, userId: string): Promise<number> {
    return this.db.query(schemaName, async (qr): Promise<number> => {
      await qr.query(
        `UPDATE notifications SET is_read = true, read_at = NOW()
         WHERE user_id = $1 AND is_read = false`,
        [userId],
      )

      const rows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM notifications WHERE user_id = $1 AND is_read = true AND read_at IS NOT NULL`,
        [userId],
      )

      return Number.parseInt(rows[0].count, 10)
    })
  }

  async create(
    schemaName: string,
    userId: string,
    data: {
      type: string
      title: string
      body: string | null
      entityType: string | null
      entityId: string | null
      data: Record<string, unknown> | null
    },
  ): Promise<NotificationRow | null> {
    return this.db.query(schemaName, async (qr): Promise<NotificationRow | null> => {
      const prefs = await this.getOrCreatePreferences(qr, userId)

      if (!prefs.in_app) return null
      if ((prefs.muted_types ?? []).includes(data.type)) return null

      const rows = await sqlRows<NotificationRow[]>(
        qr,
        `INSERT INTO notifications (user_id, notification_type, title, body, entity_type, entity_id, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
         RETURNING *`,
        [
          userId,
          data.type,
          data.title,
          data.body,
          data.entityType,
          data.entityId,
          data.data ? JSON.stringify(data.data) : null,
        ],
      )

      const row = rows[0]
      if (!row) throw new Error('Failed to create notification')
      return row
    })
  }

  async findOrCreatePreferences(schemaName: string, userId: string): Promise<PreferencesRow> {
    return this.db.query(schemaName, async (qr): Promise<PreferencesRow> => {
      return this.getOrCreatePreferences(qr, userId)
    })
  }

  async updatePreferences(
    schemaName: string,
    userId: string,
    data: { inApp?: boolean; email?: boolean; push?: boolean; mutedTypes?: string[] },
  ): Promise<PreferencesRow> {
    return this.db.query(schemaName, async (qr): Promise<PreferencesRow> => {
      await this.getOrCreatePreferences(qr, userId)

      const sets: string[] = ['updated_at = NOW()']
      const params: unknown[] = []

      if (data.inApp !== undefined) {
        params.push(data.inApp)
        sets.push(`in_app = $${params.length}`)
      }
      if (data.email !== undefined) {
        params.push(data.email)
        sets.push(`email = $${params.length}`)
      }
      if (data.push !== undefined) {
        params.push(data.push)
        sets.push(`push = $${params.length}`)
      }
      if (data.mutedTypes !== undefined) {
        params.push(data.mutedTypes)
        sets.push(`muted_types = $${params.length}`)
      }

      params.push(userId)
      await qr.query(
        `UPDATE notification_preferences SET ${sets.join(', ')} WHERE user_id = $${params.length}`,
        params,
      )

      const updated = await sqlRows<PreferencesRow[]>(
        qr,
        `SELECT * FROM notification_preferences WHERE user_id = $1`,
        [userId],
      )

      return updated[0]!
    })
  }

  private async getOrCreatePreferences(
    qr: { query: (sql: string, params?: unknown[]) => Promise<unknown> },
    userId: string,
  ): Promise<PreferencesRow> {
    const rows: PreferencesRow[] = (await qr.query(
      `SELECT * FROM notification_preferences WHERE user_id = $1`,
      [userId],
    )) as PreferencesRow[]

    if (rows[0]) return rows[0]

    const inserted: PreferencesRow[] = (await qr.query(
      `INSERT INTO notification_preferences (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING
       RETURNING *`,
      [userId],
    )) as PreferencesRow[]

    if (inserted[0]) return inserted[0]

    const refetch: PreferencesRow[] = (await qr.query(
      `SELECT * FROM notification_preferences WHERE user_id = $1`,
      [userId],
    )) as PreferencesRow[]

    return refetch[0]!
  }
}
