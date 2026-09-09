import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { PaginatedTimeline, TenantContext } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TimelineService } from '../services/timeline.service'

@ApiTags('Timeline')
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get('contacts/:id')
  @ApiEndpoint({
    summary: 'Unified timeline for a contact (activities, deals, notes)',
    roles: [UserRole.VIEWER],
    param: 'Contact UUID',
  })
  getContactTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @Query('page') page?: string,
  ): Promise<PaginatedTimeline> {
    return this.timelineService.getContactTimeline(ctx.schemaName, id, page ? Number(page) : 1)
  }

  @Get('deals/:id')
  @ApiEndpoint({
    summary: 'Unified timeline for a deal (activities, stage changes, notes)',
    roles: [UserRole.VIEWER],
    param: 'Deal UUID',
  })
  getDealTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @Query('page') page?: string,
  ): Promise<PaginatedTimeline> {
    return this.timelineService.getDealTimeline(ctx.schemaName, id, page ? Number(page) : 1)
  }

  @Get('companies/:id')
  @ApiEndpoint({
    summary: 'Unified timeline for a company (activities, deals, notes)',
    roles: [UserRole.VIEWER],
    param: 'Company UUID',
  })
  getCompanyTimeline(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @Query('page') page?: string,
  ): Promise<PaginatedTimeline> {
    return this.timelineService.getCompanyTimeline(ctx.schemaName, id, page ? Number(page) : 1)
  }
}
