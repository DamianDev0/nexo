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
import { ApiTags as SwaggerTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { PaginatedTags, Tag, TenantContext } from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { TagsService } from '../services/tags.service'
import { CreateTagDto, TagQueryDto, UpdateTagDto } from '../dto/tag.dto'

@SwaggerTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiEndpoint({
    summary: 'List tags paginated, optionally filtered by entity type',
    roles: [UserRole.VIEWER],
  })
  findAll(@TenantCtx() ctx: TenantContext, @Query() query: TagQueryDto): Promise<PaginatedTags> {
    return this.tagsService.findAll(ctx.schemaName, query)
  }

  @Post()
  @ApiEndpoint({ summary: 'Create a tag for an entity type', roles: [UserRole.ADMIN] })
  create(@Body() dto: CreateTagDto, @TenantCtx() ctx: TenantContext): Promise<Tag> {
    return this.tagsService.create(ctx.schemaName, dto)
  }

  @Patch(':id')
  @ApiEndpoint({ summary: 'Update tag name or color', roles: [UserRole.ADMIN] })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTagDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Tag> {
    return this.tagsService.update(ctx.schemaName, id, dto)
  }

  @Post(':id/restore')
  @ApiEndpoint({
    summary: 'Restore a deleted tag and put it back on the contacts that had it',
    roles: [UserRole.ADMIN],
    status: HttpStatus.OK,
  })
  restore(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<Tag> {
    return this.tagsService.restore(ctx.schemaName, id)
  }

  @Delete(':id')
  @ApiEndpoint({
    summary: 'Move a tag to the trash and take it off every contact',
    roles: [UserRole.ADMIN],
    status: HttpStatus.NO_CONTENT,
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.tagsService.remove(ctx.schemaName, id)
  }
}
