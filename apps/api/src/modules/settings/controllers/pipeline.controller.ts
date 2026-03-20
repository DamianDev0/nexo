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
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { PipelineSettingsService } from '../services/pipeline-settings.service'
import { CreatePipelineDto, ReorderStagesDto, UpdatePipelineDto } from '../dto/pipeline.dto'

@ApiTags('Settings – Pipelines')
@Controller('settings/pipelines')
export class PipelineController {
  constructor(private readonly service: PipelineSettingsService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'List all pipelines with stages' })
  findAll(@TenantCtx() ctx: TenantContext): Promise<Pipeline[]> {
    return this.service.findAll(ctx.schemaName)
  }

  @Get(':id')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOperation({ summary: 'Get a pipeline by ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Pipeline> {
    return this.service.findOne(ctx.schemaName, id)
  }

  @Post()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a pipeline with stages' })
  create(@Body() dto: CreatePipelineDto, @TenantCtx() ctx: TenantContext): Promise<Pipeline> {
    return this.service.create(ctx.schemaName, dto)
  }

  @Patch(':id')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOperation({ summary: 'Update pipeline name or default flag' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePipelineDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Pipeline> {
    return this.service.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOperation({ summary: 'Delete a pipeline (not allowed if default or only one)' })
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
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOperation({ summary: 'Kanban board: stages with deal counts and value totals' })
  getKanbanBoard(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<KanbanBoard> {
    return this.service.getKanbanBoard(ctx.schemaName, id)
  }
}
