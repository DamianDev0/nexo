import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type {
  ActivityListItem,
  CalendarActivity,
  PaginatedActivities,
  TenantContext,
  AuthenticatedUser,
} from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { ActivitiesService } from '../services/activities.service'
import {
  CreateActivityDto,
  ActivityQueryDto,
  CalendarQueryDto,
  UpdateActivityDto,
} from '../dto/activity.dto'

@ApiTags('Activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiEndpoint({
    summary: 'List activities with pagination and filters',
    roles: [UserRole.VIEWER],
  })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @Query() query: ActivityQueryDto,
  ): Promise<PaginatedActivities> {
    return this.activitiesService.findAll(ctx.schemaName, query)
  }

  @Post()
  @ApiEndpoint({
    summary: 'Create an activity (call, meeting, email, task, note, whatsapp)',
    roles: [UserRole.SALES_REP],
  })
  create(
    @Body() dto: CreateActivityDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ActivityListItem> {
    return this.activitiesService.create(ctx.schemaName, dto, user.id)
  }

  @Get('calendar')
  @ApiEndpoint({
    summary: 'Get activities by date range for calendar view',
    roles: [UserRole.VIEWER],
  })
  getCalendar(
    @TenantCtx() ctx: TenantContext,
    @Query() query: CalendarQueryDto,
  ): Promise<CalendarActivity[]> {
    return this.activitiesService.getCalendar(ctx.schemaName, query)
  }

  @Get(':id')
  @ApiEndpoint({
    summary: 'Get activity by ID with related names',
    roles: [UserRole.VIEWER],
    param: 'Activity UUID',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ActivityListItem> {
    return this.activitiesService.findOne(ctx.schemaName, id)
  }

  @Patch(':id')
  @ApiEndpoint({
    summary: 'Update an activity',
    roles: [UserRole.SALES_REP],
    param: 'Activity UUID',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActivityDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ActivityListItem> {
    return this.activitiesService.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @ApiEndpoint({
    summary: 'Soft-delete an activity',
    roles: [UserRole.MANAGER],
    param: 'Activity UUID',
    status: HttpStatus.NO_CONTENT,
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.activitiesService.remove(ctx.schemaName, id)
  }

  @Patch(':id/complete')
  @ApiEndpoint({
    summary: 'Mark activity as completed (sets completed_at = NOW())',
    roles: [UserRole.SALES_REP],
    param: 'Activity UUID',
  })
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ActivityListItem> {
    return this.activitiesService.complete(ctx.schemaName, id)
  }

  @Patch(':id/cancel')
  @ApiEndpoint({
    summary: 'Cancel an activity',
    roles: [UserRole.SALES_REP],
    param: 'Activity UUID',
  })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ActivityListItem> {
    return this.activitiesService.cancel(ctx.schemaName, id)
  }

  @Patch(':id/reopen')
  @ApiEndpoint({
    summary: 'Reopen a completed or cancelled activity',
    roles: [UserRole.SALES_REP],
    param: 'Activity UUID',
  })
  reopen(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ActivityListItem> {
    return this.activitiesService.reopen(ctx.schemaName, id)
  }
}
