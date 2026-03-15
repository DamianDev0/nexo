import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import { CacheService } from '@/shared/cache/cache.service'
import type { Pipeline, PipelineStage } from '@repo/shared-types'
import type { CreatePipelineDto, UpdatePipelineDto, ReorderStagesDto } from '../dto/pipeline.dto'
import type { PipelineRow, StageRow } from '../interfaces/pipeline.interface'

const PIPELINE_TTL = 300 // 5 minutes — pipelines change rarely (admin-only mutations)

@Injectable()
export class PipelineSettingsService {
  constructor(
    private readonly db: TenantDbService,
    private readonly cache: CacheService,
  ) {}

  // ─── List ─────────────────────────────────────────────────────────────────

  async findAll(schemaName: string): Promise<Pipeline[]> {
    const cacheKey = this.listKey(schemaName)
    const cached = await this.cache.get<Pipeline[]>(cacheKey)
    if (cached) return cached

    const result = await this.db.query<Pipeline[]>(schemaName, async (qr): Promise<Pipeline[]> => {
      const pipelines: PipelineRow[] = await qr.query(
        `SELECT id, name, is_default FROM pipelines ORDER BY is_default DESC, name ASC`,
      )
      if (!pipelines.length) return []

      const ids = pipelines.map((p) => p.id)
      const stages: StageRow[] = await qr.query(
        `SELECT id, pipeline_id, name, color, probability, position
         FROM pipeline_stages
         WHERE pipeline_id = ANY($1)
         ORDER BY pipeline_id, position ASC`,
        [ids],
      )

      const stagesByPipeline = new Map<string, PipelineStage[]>()
      for (const s of stages) {
        const arr = stagesByPipeline.get(s.pipeline_id) ?? []
        arr.push(this.mapStage(s))
        stagesByPipeline.set(s.pipeline_id, arr)
      }

      return pipelines.map((p): Pipeline => {
        const stages: PipelineStage[] = stagesByPipeline.get(p.id) ?? []
        return this.buildPipeline(p, stages)
      })
    })

    await this.cache.set(cacheKey, result, PIPELINE_TTL)
    return result
  }

  async findOne(schemaName: string, pipelineId: string): Promise<Pipeline> {
    const cacheKey = this.oneKey(schemaName, pipelineId)
    const cached = await this.cache.get<Pipeline>(cacheKey)
    if (cached) return cached

    const result = await this.db.query<Pipeline>(schemaName, async (qr): Promise<Pipeline> => {
      const pipeline = await this.fetchPipelineOrFail(qr, pipelineId)
      const stages = await this.fetchStagesForPipeline(qr, pipelineId)
      return this.buildPipeline(pipeline, stages)
    })

    await this.cache.set(cacheKey, result, PIPELINE_TTL)
    return result
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(schemaName: string, dto: CreatePipelineDto): Promise<Pipeline> {
    const result = await this.db.transactional<Pipeline>(
      schemaName,
      async (qr): Promise<Pipeline> => {
        if (dto.isDefault) {
          await qr.query(`UPDATE pipelines SET is_default = false WHERE is_default = true`)
        }

        const rows: PipelineRow[] = await qr.query(
          `INSERT INTO pipelines (name, is_default) VALUES ($1, $2) RETURNING id, name, is_default`,
          [dto.name, dto.isDefault ?? false],
        )
        if (!rows[0]) throw new Error('Pipeline insert returned no row')

        const stages = await this.insertStages(qr, rows[0].id, dto.stages)
        return this.buildPipeline(rows[0], stages)
      },
    )

    await this.cache.del(this.listKey(schemaName))
    return result
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(schemaName: string, pipelineId: string, dto: UpdatePipelineDto): Promise<Pipeline> {
    const result = await this.db.transactional<Pipeline>(
      schemaName,
      async (qr): Promise<Pipeline> => {
        const existing = await this.fetchPipelineOrFail(qr, pipelineId)

        if (dto.isDefault) {
          await qr.query(
            `UPDATE pipelines SET is_default = false WHERE is_default = true AND id != $1`,
            [pipelineId],
          )
        }

        const updates: string[] = []
        const values: unknown[] = []
        if (dto.name !== undefined) {
          updates.push(`name = $${values.push(dto.name)}`)
        }
        if (dto.isDefault !== undefined) {
          updates.push(`is_default = $${values.push(dto.isDefault)}`)
        }

        if (!updates.length) {
          const stages = await this.fetchStagesForPipeline(qr, pipelineId)
          return this.buildPipeline(existing, stages)
        }

        values.push(pipelineId)
        const updated: PipelineRow[] = await qr.query(
          `UPDATE pipelines SET ${updates.join(', ')}, updated_at = NOW()
         WHERE id = $${values.length}
         RETURNING id, name, is_default`,
          values,
        )
        const stages = await this.fetchStagesForPipeline(qr, pipelineId)
        return this.buildPipeline(updated[0] ?? existing, stages)
      },
    )

    await this.invalidateCache(schemaName, pipelineId)
    return result
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async remove(schemaName: string, pipelineId: string): Promise<void> {
    await this.db.transactional<void>(schemaName, async (qr): Promise<void> => {
      const rows: PipelineRow[] = await qr.query(
        `SELECT id, name, is_default FROM pipelines WHERE id = $1`,
        [pipelineId],
      )
      const pipeline = rows[0]
      if (!pipeline) throw new NotFoundException(`Pipeline ${pipelineId} not found`)
      if (pipeline.is_default) {
        throw new BadRequestException(
          'Cannot delete the default pipeline. Set another pipeline as default first.',
        )
      }

      const countRows: [{ count: string }] = await qr.query(
        `SELECT COUNT(*)::text AS count FROM pipelines`,
      )
      if (Number.parseInt(countRows[0].count, 10) <= 1) {
        throw new BadRequestException('Cannot delete the only pipeline.')
      }

      await qr.query(`DELETE FROM pipeline_stages WHERE pipeline_id = $1`, [pipelineId])
      await qr.query(`DELETE FROM pipelines WHERE id = $1`, [pipelineId])
    })

    await this.invalidateCache(schemaName, pipelineId)
  }

  // ─── Stages ───────────────────────────────────────────────────────────────

  async reorderStages(
    schemaName: string,
    pipelineId: string,
    dto: ReorderStagesDto,
  ): Promise<Pipeline> {
    const result = await this.db.transactional<Pipeline>(
      schemaName,
      async (qr): Promise<Pipeline> => {
        const pipeline = await this.fetchPipelineOrFail(qr, pipelineId)

        await qr.query(`DELETE FROM pipeline_stages WHERE pipeline_id = $1`, [pipelineId])
        const stages = await this.insertStages(qr, pipelineId, dto.stages)

        return this.buildPipeline(pipeline, stages)
      },
    )

    await this.invalidateCache(schemaName, pipelineId)
    return result
  }

  // ─── Private — DB helpers ─────────────────────────────────────────────────

  private async fetchPipelineOrFail(qr: QueryRunner, pipelineId: string): Promise<PipelineRow> {
    const rows: PipelineRow[] = await qr.query(
      `SELECT id, name, is_default FROM pipelines WHERE id = $1`,
      [pipelineId],
    )
    const row = rows[0]
    if (!row) throw new NotFoundException(`Pipeline ${pipelineId} not found`)
    return row
  }

  private async fetchStagesForPipeline(
    qr: QueryRunner,
    pipelineId: string,
  ): Promise<PipelineStage[]> {
    const rows: StageRow[] = await qr.query(
      `SELECT id, pipeline_id, name, color, probability, position
       FROM pipeline_stages WHERE pipeline_id = $1 ORDER BY position ASC`,
      [pipelineId],
    )
    return rows.map((s) => this.mapStage(s))
  }

  private async insertStages(
    qr: QueryRunner,
    pipelineId: string,
    stages: CreatePipelineDto['stages'],
  ): Promise<PipelineStage[]> {
    if (!stages.length) return []

    const rows: StageRow[] = await qr.query(
      `INSERT INTO pipeline_stages (pipeline_id, name, color, probability, position)
       SELECT $1, s.name, s.color, s.probability::int, s.position::int
       FROM jsonb_to_recordset($2::jsonb) AS s(name text, color text, probability int, position int)
       RETURNING id, pipeline_id, name, color, probability, position`,
      [pipelineId, JSON.stringify(stages)],
    )
    return rows.map((s) => this.mapStage(s))
  }

  // ─── Private — cache helpers ──────────────────────────────────────────────

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

  // ─── Private — mappers ────────────────────────────────────────────────────

  private buildPipeline(p: PipelineRow, stages: PipelineStage[]): Pipeline {
    return { id: p.id, name: p.name, isDefault: p.is_default, stages }
  }

  private mapStage(s: StageRow): PipelineStage {
    return {
      id: s.id,
      pipelineId: s.pipeline_id,
      name: s.name,
      color: s.color,
      probability: s.probability,
      position: s.position,
    }
  }
}
