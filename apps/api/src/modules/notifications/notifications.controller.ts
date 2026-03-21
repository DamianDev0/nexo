import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type {
  AuthenticatedUser,
  NotificationPreferences,
  PaginatedNotifications,
  TenantContext,
} from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { NotificationsService } from './notifications.service'
import { NotificationQueryDto, UpdatePreferencesDto } from './dto/notification.dto'

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'List notifications for the current user with filters' })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: NotificationQueryDto,
  ): Promise<PaginatedNotifications> {
    return this.notificationsService.findAll(ctx.schemaName, user.id, query)
  }

  @Patch('mark-all-read')
  @Auth(UserRole.VIEWER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read for the current user' })
  markAllAsRead(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ updated: number }> {
    return this.notificationsService.markAllAsRead(ctx.schemaName, user.id)
  }

  @Patch(':id/read')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.notificationsService.markAsRead(ctx.schemaName, id, user.id)
  }

  @Get('preferences')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Get notification preferences for the current user' })
  getPreferences(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationPreferences> {
    return this.notificationsService.getPreferences(ctx.schemaName, user.id)
  }

  @Patch('preferences')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Update notification preferences (channels, muted types)' })
  updatePreferences(
    @Body() dto: UpdatePreferencesDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationPreferences> {
    return this.notificationsService.updatePreferences(ctx.schemaName, user.id, dto)
  }
}
