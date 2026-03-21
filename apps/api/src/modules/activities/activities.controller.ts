import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type {
  ActivityListItem,
  CalendarActivity,
  PaginatedActivities,
  TenantContext,
  AuthenticatedUser,
} from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { ActivitiesService } from './activities.service'
import {
  CreateActivityDto,
  ActivityQueryDto,
  CalendarQueryDto,
  UpdateActivityDto,
} from './dto/activity.dto'

@ApiTags('Activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  //  CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'List activities with pagination and filters' })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @Query() query: ActivityQueryDto,
  ): Promise<PaginatedActivities> {
    return this.activitiesService.findAll(ctx.schemaName, query)
  }

  @Post()
  @Auth(UserRole.SALES_REP)
  @ApiOperation({ summary: 'Create an activity (call, meeting, email, task, note, whatsapp)' })
  create(
    @Body() dto: CreateActivityDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ActivityListItem> {
    return this.activitiesService.create(ctx.schemaName, dto, user.id)
  }

  @Get('calendar')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Get activities by date range for calendar view' })
  getCalendar(
    @TenantCtx() ctx: TenantContext,
    @Query() query: CalendarQueryDto,
  ): Promise<CalendarActivity[]> {
    return this.activitiesService.getCalendar(ctx.schemaName, query)
  }

  @Get(':id')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiOperation({ summary: 'Get activity by ID with related names' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ActivityListItem> {
    return this.activitiesService.findOne(ctx.schemaName, id)
  }

  @Patch(':id')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiOperation({ summary: 'Update an activity' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActivityDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ActivityListItem> {
    return this.activitiesService.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @Auth(UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiOperation({ summary: 'Soft-delete an activity' })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.activitiesService.remove(ctx.schemaName, id)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  Status transitions
  // ═══════════════════════════════════════════════════════════════════════════

  @Patch(':id/complete')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiOperation({ summary: 'Mark activity as completed (sets completed_at = NOW())' })
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ActivityListItem> {
    return this.activitiesService.complete(ctx.schemaName, id)
  }

  @Patch(':id/cancel')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiOperation({ summary: 'Cancel an activity' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ActivityListItem> {
    return this.activitiesService.cancel(ctx.schemaName, id)
  }

  @Patch(':id/reopen')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Activity UUID' })
  @ApiOperation({ summary: 'Reopen a completed or cancelled activity' })
  reopen(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ActivityListItem> {
    return this.activitiesService.reopen(ctx.schemaName, id)
  }
}
