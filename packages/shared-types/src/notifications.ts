import type { NotificationType } from './enums'

export type NotificationChannel = 'in_app' | 'email' | 'push'

export type Notification = {
  id: string
  userId: string
  notificationType: NotificationType
  title: string
  body: string | null
  entityType: string | null
  entityId: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export type PaginatedNotifications = {
  data: Notification[]
  total: number
  page: number
  limit: number
  unreadCount: number
}

export type NotificationPreferences = {
  id: string
  userId: string
  inApp: boolean
  email: boolean
  push: boolean
  mutedTypes: NotificationType[]
  createdAt: string
  updatedAt: string
}

export type NotificationPayload = {
  type: NotificationType
  title: string
  body?: string
  entityType?: string
  entityId?: string
}

export type UnreadCountPayload = {
  count: number
}
