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
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { UserRole } from '@repo/shared-types'
import type { TenantContext, Pipeline, KanbanBoard } from '@repo/shared-types'
import { Auth } from '@/shared/decorators/auth.decorator'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { PipelineSettingsService } from '../services/pipeline-settings.service'
import { CreatePipelineDto, ReorderStagesDto, UpdatePipelineDto } from '../dto/pipeline.dto'

@ApiTags('Settings – Pipelines')
@Controller('settings/pipelines')
export class PipelineController {
  constructor(private readonly service: PipelineSettingsService) {}

  @Get()
  @ApiEndpoint({ summary: 'List all pipelines with stages', roles: [UserRole.VIEWER] })
  findAll(@TenantCtx() ctx: TenantContext): Promise<Pipeline[]> {
    return this.service.findAll(ctx.schemaName)
  }

  @Get(':id')
  @ApiEndpoint({ summary: 'Get a pipeline by ID', roles: [UserRole.VIEWER] })
  @ApiParam({ name: 'id', type: 'string' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Pipeline> {
    return this.service.findOne(ctx.schemaName, id)
  }

  @Post()
  @ApiEndpoint({ summary: 'Create a pipeline with stages', roles: [UserRole.ADMIN] })
  create(@Body() dto: CreatePipelineDto, @TenantCtx() ctx: TenantContext): Promise<Pipeline> {
    return this.service.create(ctx.schemaName, dto)
  }

  @Patch(':id')
  @ApiEndpoint({
    summary: 'Update pipeline name or default flag',
    roles: [UserRole.ADMIN],
    status: HttpStatus.OK,
  })
  @ApiParam({ name: 'id', type: 'string' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePipelineDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Pipeline> {
    return this.service.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @ApiEndpoint({
    summary: 'Delete a pipeline (not allowed if default or only one)',
    roles: [UserRole.ADMIN],
    status: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: 'string' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<void> {
    await this.service.remove(ctx.schemaName, id)
  }

  @Patch(':id/stages')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOperation({
    summary: 'Replace all stages of a pipeline',
    description:
      'Full replacement — sends the complete ordered list. Existing stages not in the list are deleted.',
  })
  reorderStages(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderStagesDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Pipeline> {
    return this.service.reorderStages(ctx.schemaName, id, dto)
  }

  @Get(':id/kanban')
  @ApiEndpoint({
    summary: 'Kanban board: stages with deal counts and value totals',
    roles: [UserRole.VIEWER],
  })
  @ApiParam({ name: 'id', type: 'string' })
  getKanbanBoard(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<KanbanBoard> {
    return this.service.getKanbanBoard(ctx.schemaName, id)
  }
}
