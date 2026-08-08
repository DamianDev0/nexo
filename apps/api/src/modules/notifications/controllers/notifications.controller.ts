import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type {
  AuthenticatedUser,
  NotificationPreferences,
  PaginatedNotifications,
  TenantContext,
} from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { NotificationsService } from '../services/notifications.service'
import { NotificationQueryDto, UpdatePreferencesDto } from '../dto/notification.dto'

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiEndpoint({
    summary: 'List notifications for the current user with filters',
    roles: [UserRole.VIEWER],
  })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: NotificationQueryDto,
  ): Promise<PaginatedNotifications> {
    return this.notificationsService.findAll(ctx.schemaName, user.id, query)
  }

  @Patch('mark-all-read')
  @ApiEndpoint({
    summary: 'Mark all notifications as read for the current user',
    roles: [UserRole.VIEWER],
    status: HttpStatus.OK,
  })
  markAllAsRead(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ updated: number }> {
    return this.notificationsService.markAllAsRead(ctx.schemaName, user.id)
  }

  @Patch(':id/read')
  @ApiEndpoint({
    summary: 'Mark a single notification as read',
    roles: [UserRole.VIEWER],
    param: 'Notification UUID',
    status: HttpStatus.NO_CONTENT,
  })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.notificationsService.markAsRead(ctx.schemaName, id, user.id)
  }

  @Get('preferences')
  @ApiEndpoint({
    summary: 'Get notification preferences for the current user',
    roles: [UserRole.VIEWER],
  })
  getPreferences(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationPreferences> {
    return this.notificationsService.getPreferences(ctx.schemaName, user.id)
  }

  @Patch('preferences')
  @ApiEndpoint({
    summary: 'Update notification preferences (channels, muted types)',
    roles: [UserRole.VIEWER],
  })
  updatePreferences(
    @Body() dto: UpdatePreferencesDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationPreferences> {
    return this.notificationsService.updatePreferences(ctx.schemaName, user.id, dto)
  }
}
