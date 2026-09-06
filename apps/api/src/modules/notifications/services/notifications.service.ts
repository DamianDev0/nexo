import { Injectable, NotFoundException } from '@nestjs/common'
import type {
  Notification,
  NotificationPreferences,
  NotificationType,
  PaginatedNotifications,
  NotificationData,
} from '@repo/shared-types'
import { DEFAULT_PAGE_SIZE } from '@repo/shared-utils'
import type { NotificationQueryDto, UpdatePreferencesDto } from '../dto/notification.dto'
import { NotificationsRepository } from '../repositories/notifications.repository'
import { mapNotification, mapPreferences } from '../mappers/notification.mapper'

@Injectable()
export class NotificationsService {
  constructor(private readonly repository: NotificationsRepository) {}

  async findAll(
    schemaName: string,
    userId: string,
    query: NotificationQueryDto,
  ): Promise<PaginatedNotifications> {
    const page = query.page ?? 1
    const limit = query.limit ?? DEFAULT_PAGE_SIZE

    const { rows, total, unreadCount } = await this.repository.findAll(schemaName, userId, {
      unreadOnly: query.unread === 'true',
      notificationType: query.notificationType,
      limit,
      offset: (page - 1) * limit,
    })

    return {
      data: rows.map((r) => mapNotification(r)),
      total,
      page,
      limit,
      unreadCount,
    }
  }

  async getUnreadCount(schemaName: string, userId: string): Promise<number> {
    return this.repository.getUnreadCount(schemaName, userId)
  }

  async markAsRead(schemaName: string, notificationId: string, userId: string): Promise<void> {
    const updated = await this.repository.markAsRead(schemaName, notificationId, userId)
    if (updated === 0) {
      throw new NotFoundException(`Notification ${notificationId} not found`)
    }
  }

  async markAllAsRead(schemaName: string, userId: string): Promise<{ updated: number }> {
    const updated = await this.repository.markAllAsRead(schemaName, userId)
    return { updated }
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
      data?: NotificationData
    },
  ): Promise<Notification | null> {
    const row = await this.repository.create(schemaName, userId, {
      type: payload.type,
      title: payload.title,
      body: payload.body ?? null,
      entityType: payload.entityType ?? null,
      entityId: payload.entityId ?? null,
      data: payload.data ?? null,
    })

    return row ? mapNotification(row) : null
  }

  async getPreferences(schemaName: string, userId: string): Promise<NotificationPreferences> {
    return mapPreferences(await this.repository.findOrCreatePreferences(schemaName, userId))
  }

  async updatePreferences(
    schemaName: string,
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<NotificationPreferences> {
    const row = await this.repository.updatePreferences(schemaName, userId, {
      inApp: dto.inApp,
      email: dto.email,
      push: dto.push,
      mutedTypes: dto.mutedTypes,
    })
    return mapPreferences(row)
  }
}
