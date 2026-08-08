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
import type { AuthenticatedUser, SavedFilter, TenantContext } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { SavedFiltersService } from '../services/saved-filters.service'
import {
  CreateSavedFilterDto,
  SavedFilterQueryDto,
  UpdateSavedFilterDto,
} from '../dto/saved-filter.dto'

@ApiTags('Saved Filters')
@Controller('saved-filters')
export class SavedFiltersController {
  constructor(private readonly service: SavedFiltersService) {}

  @Get()
  @ApiEndpoint({ summary: 'List saved filters for the current user', roles: [UserRole.VIEWER] })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SavedFilterQueryDto,
  ): Promise<SavedFilter[]> {
    return this.service.findAll(ctx.schemaName, user.id, query.entityType)
  }

  @Post()
  @ApiEndpoint({ summary: 'Save a filter view', roles: [UserRole.VIEWER] })
  create(
    @Body() dto: CreateSavedFilterDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SavedFilter> {
    return this.service.create(ctx.schemaName, user.id, dto)
  }

  @Patch(':id')
  @ApiEndpoint({ summary: 'Update a saved filter', roles: [UserRole.VIEWER] })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSavedFilterDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SavedFilter> {
    return this.service.update(ctx.schemaName, id, user.id, dto)
  }

  @Delete(':id')
  @ApiEndpoint({
    summary: 'Delete a saved filter',
    roles: [UserRole.VIEWER],
    status: HttpStatus.NO_CONTENT,
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.service.remove(ctx.schemaName, id, user.id)
  }
}
