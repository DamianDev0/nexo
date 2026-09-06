import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type {
  AuthenticatedUser,
  BulkAction,
  BulkActionError,
  PaginatedBulkActions,
  TenantContext,
} from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { BulkActionQueryDto, CreateBulkActionDto } from '../dto/bulk-action.dto'
import { BulkActionsService } from '../services/bulk-actions.service'

@ApiTags('Bulk Actions')
@Controller('bulk-actions')
export class BulkActionsController {
  constructor(private readonly service: BulkActionsService) {}

  @Post()
  @ApiEndpoint({
    summary: 'Queue a bulk action over a selection of contacts, companies or deals',
    roles: [UserRole.SALES_REP],
    status: HttpStatus.ACCEPTED,
  })
  create(
    @Body() dto: CreateBulkActionDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BulkAction> {
    return this.service.create(ctx, user, dto)
  }

  @Get()
  @ApiEndpoint({ summary: 'Bulk action history for the workspace', roles: [UserRole.VIEWER] })
  findAll(
    @Query() query: BulkActionQueryDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<PaginatedBulkActions> {
    return this.service.findAll(ctx.schemaName, query)
  }

  @Get(':id')
  @ApiEndpoint({
    summary: 'Bulk action status and progress',
    roles: [UserRole.VIEWER],
    param: 'Bulk action UUID',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<BulkAction> {
    return this.service.findOne(ctx.schemaName, id)
  }

  @Get(':id/errors')
  @ApiEndpoint({
    summary: 'Per-record errors of a bulk action',
    roles: [UserRole.VIEWER],
    param: 'Bulk action UUID',
  })
  errors(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<BulkActionError[]> {
    return this.service.errors(ctx.schemaName, id)
  }

  @Post(':id/revert')
  @ApiEndpoint({
    summary: 'Undo a finished bulk action by restoring the values it changed',
    roles: [UserRole.MANAGER],
    param: 'Bulk action UUID',
    status: HttpStatus.ACCEPTED,
  })
  revert(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BulkAction> {
    return this.service.revert(ctx, user, id)
  }

  @Post(':id/cancel')
  @ApiEndpoint({
    summary: 'Cancel a bulk action',
    roles: [UserRole.MANAGER],
    param: 'Bulk action UUID',
    status: HttpStatus.OK,
  })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BulkAction> {
    return this.service.cancel(ctx.schemaName, id, user.id)
  }

  @Post(':id/pause')
  @ApiEndpoint({
    summary: 'Pause a bulk action between batches',
    roles: [UserRole.MANAGER],
    param: 'Bulk action UUID',
    status: HttpStatus.OK,
  })
  pause(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<BulkAction> {
    return this.service.pause(ctx.schemaName, id)
  }

  @Post(':id/resume')
  @ApiEndpoint({
    summary: 'Resume a paused bulk action',
    roles: [UserRole.MANAGER],
    param: 'Bulk action UUID',
    status: HttpStatus.OK,
  })
  resume(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<BulkAction> {
    return this.service.resume(ctx, id)
  }
}
