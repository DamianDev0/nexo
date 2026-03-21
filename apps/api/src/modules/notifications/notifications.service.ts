import { Injectable, NotFoundException } from '@nestjs/common'
import type {
  Notification,
  NotificationPreferences,
  NotificationType,
  PaginatedNotifications,
} from '@repo/shared-types'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type { NotificationQueryDto, UpdatePreferencesDto } from './dto/notification.dto'
import type { NotificationRow, PreferencesRow } from './interfaces/notification-row.interfaces'

@Injectable()
export class NotificationsService {
  constructor(private readonly db: TenantDbService) {}

  async findAll(
    schemaName: string,
    userId: string,
    query: NotificationQueryDto,
  ): Promise<PaginatedNotifications> {
    return this.db.query(schemaName, async (qr): Promise<PaginatedNotifications> => {
      const page = query.page ?? 1
      const limit = query.limit ?? 25
      const offset = (page - 1) * limit

      const conditions: string[] = ['user_id = $1']
      const params: unknown[] = [userId]

      if (query.unread === 'true') {
        conditions.push('is_read = false')
      }

      if (query.notificationType) {
        params.push(query.notificationType)
        conditions.push(`notification_type = $${params.length}`)
      }

      const where = conditions.join(' AND ')

      const countRows: [{ count: string }] = await qr.query(
        `SELECT COUNT(*)::text AS count FROM notifications WHERE ${where}`,
        params,
      )
      const total = Number.parseInt(countRows[0].count, 10)

      const unreadRows: [{ count: string }] = await qr.query(
        `SELECT COUNT(*)::text AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
        [userId],
      )
      const unreadCount = Number.parseInt(unreadRows[0].count, 10)

      const dataParams = [...params, limit, offset]
      const rows: NotificationRow[] = await qr.query(
        `SELECT * FROM notifications
         WHERE ${where}
         ORDER BY created_at DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams,
      )

      return {
        data: rows.map((r) => this.mapNotification(r)),
        total,
        page,
        limit,
        unreadCount,
      }
    })
  }

  async getUnreadCount(schemaName: string, userId: string): Promise<number> {
    return this.db.query(schemaName, async (qr): Promise<number> => {
      const rows: [{ count: string }] = await qr.query(
        `SELECT COUNT(*)::text AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
        [userId],
      )
      return Number.parseInt(rows[0].count, 10)
    })
  }

  async markAsRead(schemaName: string, notificationId: string, userId: string): Promise<void> {
    return this.db.query(schemaName, async (qr): Promise<void> => {
      const result: NotificationRow[] = await qr.query(
        `UPDATE notifications SET is_read = true, read_at = NOW()
         WHERE id = $1 AND user_id = $2 AND is_read = false
         RETURNING id`,
        [notificationId, userId],
      )

      if (result.length === 0) {
        throw new NotFoundException(`Notification ${notificationId} not found`)
      }
    })
  }

  async markAllAsRead(schemaName: string, userId: string): Promise<{ updated: number }> {
    return this.db.query(schemaName, async (qr): Promise<{ updated: number }> => {
      await qr.query(
        `UPDATE notifications SET is_read = true, read_at = NOW()
         WHERE user_id = $1 AND is_read = false`,
        [userId],
      )

      const rows: [{ count: string }] = await qr.query(
        `SELECT COUNT(*)::text AS count FROM notifications WHERE user_id = $1 AND is_read = true AND read_at IS NOT NULL`,
        [userId],
      )

      return { updated: Number.parseInt(rows[0].count, 10) }
    })
  }

  async send(
    schemaName: string,
    userId: string,
    payload: {
      type: NotificationType
      title: string
      body?: string
      entityType?: string
      entityId?: string
    },
  ): Promise<Notification> {
    return this.db.query(schemaName, async (qr): Promise<Notification> => {
      const prefs = await this.getOrCreatePreferences(qr, userId)

      if (!prefs.in_app) return this.mapNotification({} as NotificationRow)
      if ((prefs.muted_types ?? []).includes(payload.type))
        return this.mapNotification({} as NotificationRow)

      const rows: NotificationRow[] = await qr.query(
        `INSERT INTO notifications (user_id, notification_type, title, body, entity_type, entity_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          userId,
          payload.type,
          payload.title,
          payload.body ?? null,
          payload.entityType ?? null,
          payload.entityId ?? null,
        ],
      )

      const row = rows[0]
      if (!row) throw new Error('Failed to create notification')
      return this.mapNotification(row)
    })
  }

  async getPreferences(schemaName: string, userId: string): Promise<NotificationPreferences> {
    return this.db.query(schemaName, async (qr): Promise<NotificationPreferences> => {
      return this.mapPreferences(await this.getOrCreatePreferences(qr, userId))
    })
  }

  async updatePreferences(
    schemaName: string,
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<NotificationPreferences> {
    return this.db.query(schemaName, async (qr): Promise<NotificationPreferences> => {
      await this.getOrCreatePreferences(qr, userId)

      const sets: string[] = ['updated_at = NOW()']
      const params: unknown[] = []

      if (dto.inApp !== undefined) {
        params.push(dto.inApp)
        sets.push(`in_app = $${params.length}`)
      }
      if (dto.email !== undefined) {
        params.push(dto.email)
        sets.push(`email = $${params.length}`)
      }
      if (dto.push !== undefined) {
        params.push(dto.push)
        sets.push(`push = $${params.length}`)
      }
      if (dto.mutedTypes !== undefined) {
        params.push(dto.mutedTypes)
        sets.push(`muted_types = $${params.length}`)
      }

      params.push(userId)
      await qr.query(
        `UPDATE notification_preferences SET ${sets.join(', ')} WHERE user_id = $${params.length}`,
        params,
      )

      const updated: PreferencesRow[] = await qr.query(
        `SELECT * FROM notification_preferences WHERE user_id = $1`,
        [userId],
      )

      return this.mapPreferences(updated[0]!)
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

  private mapNotification(r: NotificationRow): Notification {
    return {
      id: r.id,
      userId: r.user_id,
      notificationType: r.notification_type as NotificationType,
      title: r.title,
      body: r.body,
      entityType: r.entity_type,
      entityId: r.entity_id,
      isRead: r.is_read,
      readAt: r.read_at,
      createdAt: r.created_at,
    }
  }

  private mapPreferences(r: PreferencesRow): NotificationPreferences {
    return {
      id: r.id,
      userId: r.user_id,
      inApp: r.in_app,
      email: r.email,
      push: r.push,
      mutedTypes: (r.muted_types ?? []) as NotificationType[],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }
  }
}
