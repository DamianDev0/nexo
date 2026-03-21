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
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { AuthenticatedUser, SavedFilter, TenantContext } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { SavedFiltersService } from './saved-filters.service'

@ApiTags('Saved Filters')
@Controller('saved-filters')
export class SavedFiltersController {
  constructor(private readonly service: SavedFiltersService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'List saved filters for the current user' })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Query('entityType') entityType?: string,
  ): Promise<SavedFilter[]> {
    return this.service.findAll(ctx.schemaName, user.id, entityType)
  }

  @Post()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Save a filter view' })
  create(
    @Body()
    dto: {
      entityType: string
      name: string
      filters: Record<string, unknown>
      isDefault?: boolean
    },
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SavedFilter> {
    return this.service.create(ctx.schemaName, user.id, dto)
  }

  @Patch(':id')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Update a saved filter' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<{ name: string; filters: Record<string, unknown>; isDefault: boolean }>,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SavedFilter> {
    return this.service.update(ctx.schemaName, id, user.id, dto)
  }

  @Delete(':id')
  @Auth(UserRole.VIEWER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a saved filter' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.service.remove(ctx.schemaName, id, user.id)
  }
}
