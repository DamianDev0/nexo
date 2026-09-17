import { Body, Delete, Get, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { AuthenticatedUser, ObjectView, TenantContext } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import {
  CreateObjectViewDto,
  DuplicateObjectViewDto,
  ReorderObjectViewsDto,
  UpdateObjectViewDto,
} from '../dto/object-view.dto'
import type { ObjectTableDefinition } from '../interfaces/object-definition.interfaces'
import { ObjectViewsService } from '../services/object-views.service'

export abstract class ObjectViewsController {
  protected abstract readonly definition: ObjectTableDefinition

  constructor(protected readonly views: ObjectViewsService) {}

  @Get()
  @ApiEndpoint({ summary: 'List own and shared views', roles: [UserRole.VIEWER] })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ObjectView[]> {
    return this.views.findAll(ctx.schemaName, this.definition, user.id)
  }

  @Post()
  @ApiEndpoint({ summary: 'Create a view', roles: [UserRole.VIEWER] })
  create(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateObjectViewDto,
  ): Promise<ObjectView> {
    return this.views.create(ctx.schemaName, this.definition, user.id, dto)
  }

  @Patch('reorder')
  @ApiEndpoint({
    summary: 'Reorder own views',
    roles: [UserRole.VIEWER],
    status: HttpStatus.NO_CONTENT,
  })
  reorder(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderObjectViewsDto,
  ): Promise<void> {
    return this.views.reorder(ctx.schemaName, this.definition, user.id, dto)
  }

  @Patch(':id')
  @ApiEndpoint({ summary: 'Update a view', roles: [UserRole.VIEWER] })
  @ApiParam({ name: 'id', format: 'uuid' })
  update(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateObjectViewDto,
  ): Promise<ObjectView> {
    return this.views.update(ctx.schemaName, this.definition, user.id, id, dto)
  }

  @Post(':id/duplicate')
  @ApiEndpoint({ summary: 'Duplicate a visible view', roles: [UserRole.VIEWER] })
  @ApiParam({ name: 'id', format: 'uuid' })
  duplicate(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DuplicateObjectViewDto,
  ): Promise<ObjectView> {
    return this.views.duplicate(ctx.schemaName, this.definition, user.id, id, dto)
  }

  @Delete(':id')
  @ApiEndpoint({
    summary: 'Delete an own view',
    roles: [UserRole.VIEWER],
    status: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  remove(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.views.remove(ctx.schemaName, this.definition, user.id, id)
  }
}
