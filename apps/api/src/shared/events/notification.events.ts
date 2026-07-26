import type { NotificationType } from '@repo/shared-types'

export interface NotificationEvent {
  schemaName: string
  tenantId: string
  userId: string
  type: NotificationType
  title: string
  body?: string
  entityType?: string
  entityId?: string
}
