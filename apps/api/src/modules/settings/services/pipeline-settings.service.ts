import { Injectable } from '@nestjs/common'
import { CacheService } from '@/shared/cache/cache.service'
import type { Pipeline, KanbanBoard } from '@repo/shared-types'
import type { CreatePipelineDto, UpdatePipelineDto, ReorderStagesDto } from '../dto/pipeline.dto'
import { PipelineSettingsRepository } from '../repositories/pipeline-settings.repository'
import {
  buildPipeline,
  buildPipelineList,
  mapKanbanStage,
  mapStage,
} from '../mappers/pipeline.mapper'
import { CACHE_TTL_SHORT_SECONDS } from '@/shared/cache/cache.constants'

@Injectable()
export class PipelineSettingsService {
  constructor(
    private readonly repo: PipelineSettingsRepository,
    private readonly cache: CacheService,
  ) {}

  async findAll(schemaName: string): Promise<Pipeline[]> {
    const cacheKey = this.listKey(schemaName)
    const cached = await this.cache.get<Pipeline[]>(cacheKey)
    if (cached) return cached

    const { pipelines, stages } = await this.repo.findAllWithStages(schemaName)
    const result = buildPipelineList(pipelines, stages)

    await this.cache.set(cacheKey, result, CACHE_TTL_SHORT_SECONDS)
    return result
  }

  async findOne(schemaName: string, pipelineId: string): Promise<Pipeline> {
    const cacheKey = this.oneKey(schemaName, pipelineId)
    const cached = await this.cache.get<Pipeline>(cacheKey)
    if (cached) return cached

    const { pipeline, stages } = await this.repo.findOneWithStages(schemaName, pipelineId)
    const result = buildPipeline(pipeline, stages.map(mapStage))

    await this.cache.set(cacheKey, result, CACHE_TTL_SHORT_SECONDS)
    return result
  }

  async create(schemaName: string, dto: CreatePipelineDto): Promise<Pipeline> {
    const { pipeline, stages } = await this.repo.create(
      schemaName,
      dto.name,
      dto.isDefault,
      dto.stages,
    )

    await this.cache.del(this.listKey(schemaName))
    return buildPipeline(pipeline, stages.map(mapStage))
  }

  async update(schemaName: string, pipelineId: string, dto: UpdatePipelineDto): Promise<Pipeline> {
    const { pipeline, stages } = await this.repo.update(schemaName, pipelineId, {
      name: dto.name,
      isDefault: dto.isDefault,
    })

    await this.invalidateCache(schemaName, pipelineId)
    return buildPipeline(pipeline, stages.map(mapStage))
  }

  async remove(schemaName: string, pipelineId: string): Promise<void> {
    await this.repo.remove(schemaName, pipelineId)
    await this.invalidateCache(schemaName, pipelineId)
  }

  async reorderStages(
    schemaName: string,
    pipelineId: string,
    dto: ReorderStagesDto,
  ): Promise<Pipeline> {
    const { pipeline, stages } = await this.repo.replaceStages(schemaName, pipelineId, dto.stages)

    await this.invalidateCache(schemaName, pipelineId)
    return buildPipeline(pipeline, stages.map(mapStage))
  }

  async getKanbanBoard(schemaName: string, pipelineId: string): Promise<KanbanBoard> {
    const { pipeline, stages } = await this.repo.findKanban(schemaName, pipelineId)
    return {
      pipeline: { id: pipeline.id, name: pipeline.name },
      stages: stages.map(mapKanbanStage),
    }
  }

  private listKey(schemaName: string): string {
    return `pipeline:list:${schemaName}`
  }

  private oneKey(schemaName: string, pipelineId: string): string {
    return `pipeline:${schemaName}:${pipelineId}`
  }

  private async invalidateCache(schemaName: string, pipelineId: string): Promise<void> {
    await Promise.all([
      this.cache.del(this.listKey(schemaName)),
      this.cache.del(this.oneKey(schemaName, pipelineId)),
    ])
  }
}
