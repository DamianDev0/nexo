import type { Notification, NotificationPreferences, NotificationType } from '@repo/shared-types'
import type { NotificationRow, PreferencesRow } from '../interfaces/notification-row.interfaces'

export function mapNotification(r: NotificationRow): Notification {
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

export function mapPreferences(r: PreferencesRow): NotificationPreferences {
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
