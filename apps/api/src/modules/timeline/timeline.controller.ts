import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { PaginatedTimeline, TenantContext } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TimelineService } from './timeline.service'

@ApiTags('Timeline')
@Controller()
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get('contacts/:id/timeline')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  @ApiOperation({ summary: 'Unified timeline for a contact (activities, deals, notes)' })
  getContactTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @Query('page') page?: string,
  ): Promise<PaginatedTimeline> {
    return this.timelineService.getContactTimeline(ctx.schemaName, id, page ? Number(page) : 1)
  }

  @Get('deals/:id/timeline')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', description: 'Deal UUID' })
  @ApiOperation({ summary: 'Unified timeline for a deal (activities, stage changes, notes)' })
  getDealTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @Query('page') page?: string,
  ): Promise<PaginatedTimeline> {
    return this.timelineService.getDealTimeline(ctx.schemaName, id, page ? Number(page) : 1)
  }

  @Get('companies/:id/timeline')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiOperation({ summary: 'Unified timeline for a company (activities, deals, notes)' })
  getCompanyTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @Query('page') page?: string,
  ): Promise<PaginatedTimeline> {
    return this.timelineService.getCompanyTimeline(ctx.schemaName, id, page ? Number(page) : 1)
  }
}
