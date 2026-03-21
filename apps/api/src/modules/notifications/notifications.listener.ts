import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import type { NotificationType } from '@repo/shared-types'
import type { NotificationEvent } from '@/shared/events/notification.events'
import { NotificationsService } from './notifications.service'
import { NotificationsGateway } from './notifications.gateway'

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly gateway: NotificationsGateway,
  ) {}

  @OnEvent('deal.**')
  @OnEvent('activity.**')
  @OnEvent('invoice.**')
  @OnEvent('payment.**')
  @OnEvent('stock.**')
  @OnEvent('import.**')
  async handleNotificationEvent(event: NotificationEvent): Promise<void> {
    const notification = await this.notificationsService.send(event.schemaName, event.userId, {
      type: event.type as NotificationType,
      title: event.title,
      body: event.body,
      entityType: event.entityType,
      entityId: event.entityId,
    })

    if (notification) {
      this.gateway.emitToUser(event.userId, 'notification:new', notification)

      const unreadCount = await this.notificationsService.getUnreadCount(
        event.schemaName,
        event.userId,
      )
      this.gateway.emitToUser(event.userId, 'notifications:unread-count', { count: unreadCount })
    }
  }
}
