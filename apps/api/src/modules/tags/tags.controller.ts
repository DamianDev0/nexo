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
import { ApiOperation, ApiTags as SwaggerTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { Tag, TenantContext } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TagsService } from './tags.service'

@SwaggerTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'List all tags, optionally filtered by entity type' })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @Query('entityType') entityType?: string,
  ): Promise<Tag[]> {
    return this.tagsService.findAll(ctx.schemaName, entityType)
  }

  @Post()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a tag for an entity type' })
  create(
    @Body() dto: { name: string; color?: string; entityType: string },
    @TenantCtx() ctx: TenantContext,
  ): Promise<Tag> {
    return this.tagsService.create(ctx.schemaName, dto)
  }

  @Patch(':id')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update tag name or color' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { name?: string; color?: string },
    @TenantCtx() ctx: TenantContext,
  ): Promise<Tag> {
    return this.tagsService.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a tag' })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.tagsService.remove(ctx.schemaName, id)
  }
}
