import { Logger } from '@nestjs/common'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { NotificationsService } from './notifications.service'

interface JwtPayload {
  sub: string
  tenantId: string
  schemaName: string
}

@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(NotificationsGateway.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client)
      if (!token) {
        client.disconnect()
        return
      }

      const payload = this.jwtService.verify<JwtPayload>(token)
      const userId = payload.sub
      const tenantId = payload.tenantId

      client.data.userId = userId
      client.data.tenantId = tenantId
      client.data.schemaName = payload.schemaName

      await client.join(`user:${userId}`)
      await client.join(`tenant:${tenantId}`)

      const unreadCount = await this.notificationsService.getUnreadCount(payload.schemaName, userId)
      client.emit('notifications:unread-count', { count: unreadCount })

      this.logger.debug(`Client connected: user=${userId} tenant=${tenantId}`)
    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data.userId as string | undefined
    if (userId) {
      this.logger.debug(`Client disconnected: user=${userId}`)
    }
  }

  @SubscribeMessage('notifications:list')
  async handleList(
    client: Socket,
    payload: { unread?: string; notificationType?: string; page?: number; limit?: number },
  ): Promise<void> {
    const { schemaName, userId } = client.data as { schemaName: string; userId: string }
    const result = await this.notificationsService.findAll(schemaName, userId, payload)
    client.emit('notifications:list', result)
  }

  @SubscribeMessage('notifications:mark-read')
  async handleMarkRead(client: Socket, payload: { notificationId: string }): Promise<void> {
    const { schemaName, userId } = client.data as { schemaName: string; userId: string }
    await this.notificationsService.markAsRead(schemaName, payload.notificationId, userId)
    await this.emitUnreadCount(client)
  }

  @SubscribeMessage('notifications:mark-all-read')
  async handleMarkAllRead(client: Socket): Promise<void> {
    const { schemaName, userId } = client.data as { schemaName: string; userId: string }
    const result = await this.notificationsService.markAllAsRead(schemaName, userId)
    client.emit('notifications:mark-all-read', result)
    await this.emitUnreadCount(client)
  }

  @SubscribeMessage('notifications:get-preferences')
  async handleGetPreferences(client: Socket): Promise<void> {
    const { schemaName, userId } = client.data as { schemaName: string; userId: string }
    const prefs = await this.notificationsService.getPreferences(schemaName, userId)
    client.emit('notifications:preferences', prefs)
  }

  @SubscribeMessage('notifications:update-preferences')
  async handleUpdatePreferences(
    client: Socket,
    payload: { inApp?: boolean; email?: boolean; push?: boolean; mutedTypes?: string[] },
  ): Promise<void> {
    const { schemaName, userId } = client.data as { schemaName: string; userId: string }
    const prefs = await this.notificationsService.updatePreferences(schemaName, userId, payload)
    client.emit('notifications:preferences', prefs)
  }

  private async emitUnreadCount(client: Socket): Promise<void> {
    const { schemaName, userId } = client.data as { schemaName: string; userId: string }
    const count = await this.notificationsService.getUnreadCount(schemaName, userId)
    client.emit('notifications:unread-count', { count })
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    this.server.to(`user:${userId}`).emit(event, data)
  }

  emitToTenant(tenantId: string, event: string, data: unknown): void {
    this.server.to(`tenant:${tenantId}`).emit(event, data)
  }

  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.auth?.token as string | undefined
    if (authHeader) return authHeader

    const queryToken = client.handshake.query?.token as string | undefined
    return queryToken ?? null
  }
}
