import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { TenantDbService } from '@/shared/database/tenant-db.service'
import type {
  KanbanStageRow,
  PipelineRow,
  StageInput,
  StageRow,
} from '../interfaces/pipeline.interface'
import { sqlRows } from '@/shared/database/sql.util'

@Injectable()
export class PipelineSettingsRepository {
  constructor(private readonly db: TenantDbService) {}

  async findAllWithStages(
    schemaName: string,
  ): Promise<{ pipelines: PipelineRow[]; stages: StageRow[] }> {
    return this.db.query(schemaName, async (qr) => {
      const pipelines = await sqlRows<PipelineRow[]>(
        qr,
        `SELECT id, name, is_default FROM pipelines ORDER BY is_default DESC, name ASC`,
      )
      if (!pipelines.length) return { pipelines, stages: [] }

      const ids = pipelines.map((p) => p.id)
      const stages = await sqlRows<StageRow[]>(
        qr,
        `SELECT id, pipeline_id, name, color, probability, position
         FROM pipeline_stages
         WHERE pipeline_id = ANY($1)
         ORDER BY pipeline_id, position ASC`,
        [ids],
      )
      return { pipelines, stages }
    })
  }

  async findOneWithStages(
    schemaName: string,
    pipelineId: string,
  ): Promise<{ pipeline: PipelineRow; stages: StageRow[] }> {
    return this.db.query(schemaName, async (qr) => {
      const pipeline = await this.fetchPipelineOrFail(qr, pipelineId)
      const stages = await this.fetchStagesForPipeline(qr, pipelineId)
      return { pipeline, stages }
    })
  }

  async create(
    schemaName: string,
    name: string,
    isDefault: boolean | undefined,
    stages: StageInput[],
  ): Promise<{ pipeline: PipelineRow; stages: StageRow[] }> {
    return this.db.transactional(schemaName, async (qr) => {
      if (isDefault) {
        await qr.query(`UPDATE pipelines SET is_default = false WHERE is_default = true`)
      }

      const rows = await sqlRows<PipelineRow[]>(
        qr,
        `INSERT INTO pipelines (name, is_default) VALUES ($1, $2) RETURNING id, name, is_default`,
        [name, isDefault ?? false],
      )
      if (!rows[0]) throw new InternalServerErrorException('Pipeline insert returned no row')

      const inserted = await this.insertStages(qr, rows[0].id, stages)
      return { pipeline: rows[0], stages: inserted }
    })
  }

  async update(
    schemaName: string,
    pipelineId: string,
    patch: { name?: string; isDefault?: boolean },
  ): Promise<{ pipeline: PipelineRow; stages: StageRow[] }> {
    return this.db.transactional(schemaName, async (qr) => {
      const existing = await this.fetchPipelineOrFail(qr, pipelineId)

      if (patch.isDefault) {
        await qr.query(
          `UPDATE pipelines SET is_default = false WHERE is_default = true AND id != $1`,
          [pipelineId],
        )
      }

      const updates: string[] = []
      const values: unknown[] = []
      if (patch.name !== undefined) {
        updates.push(`name = $${values.push(patch.name)}`)
      }
      if (patch.isDefault !== undefined) {
        updates.push(`is_default = $${values.push(patch.isDefault)}`)
      }

      if (!updates.length) {
        const stages = await this.fetchStagesForPipeline(qr, pipelineId)
        return { pipeline: existing, stages }
      }

      values.push(pipelineId)
      const updated = await sqlRows<PipelineRow[]>(
        qr,
        `UPDATE pipelines SET ${updates.join(', ')}, updated_at = NOW()
         WHERE id = $${values.length}
         RETURNING id, name, is_default`,
        values,
      )
      const stages = await this.fetchStagesForPipeline(qr, pipelineId)
      return { pipeline: updated[0] ?? existing, stages }
    })
  }

  async remove(schemaName: string, pipelineId: string): Promise<void> {
    await this.db.transactional<void>(schemaName, async (qr): Promise<void> => {
      const rows = await sqlRows<PipelineRow[]>(
        qr,
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

      const countRows = await sqlRows<[{ count: string }]>(
        qr,
        `SELECT COUNT(*)::text AS count FROM pipelines`,
      )
      if (Number.parseInt(countRows[0].count, 10) <= 1) {
        throw new BadRequestException('Cannot delete the only pipeline.')
      }

      await qr.query(`DELETE FROM pipeline_stages WHERE pipeline_id = $1`, [pipelineId])
      await qr.query(`DELETE FROM pipelines WHERE id = $1`, [pipelineId])
    })
  }

  async replaceStages(
    schemaName: string,
    pipelineId: string,
    stages: StageInput[],
  ): Promise<{ pipeline: PipelineRow; stages: StageRow[] }> {
    return this.db.transactional(schemaName, async (qr) => {
      const pipeline = await this.fetchPipelineOrFail(qr, pipelineId)

      await qr.query(`DELETE FROM pipeline_stages WHERE pipeline_id = $1`, [pipelineId])
      const inserted = await this.insertStages(qr, pipelineId, stages)

      return { pipeline, stages: inserted }
    })
  }

  async findKanban(
    schemaName: string,
    pipelineId: string,
  ): Promise<{ pipeline: PipelineRow; stages: KanbanStageRow[] }> {
    return this.db.query(schemaName, async (qr) => {
      const pipeline = await this.fetchPipelineOrFail(qr, pipelineId)

      const rows = await sqlRows<KanbanStageRow[]>(
        qr,
        `SELECT
           ps.id, ps.pipeline_id, ps.name, ps.color, ps.probability, ps.position,
           COUNT(d.id)::text                         AS deal_count,
           COALESCE(SUM(d.value_cents), 0)::text     AS total_value_cents
         FROM pipeline_stages ps
         LEFT JOIN deals d
           ON d.stage_id = ps.id AND d.is_active = true AND d.status = 'open'
         WHERE ps.pipeline_id = $1
         GROUP BY ps.id
         ORDER BY ps.position ASC`,
        [pipelineId],
      )

      return { pipeline, stages: rows }
    })
  }

  private async fetchPipelineOrFail(qr: QueryRunner, pipelineId: string): Promise<PipelineRow> {
    const rows = await sqlRows<PipelineRow[]>(
      qr,
      `SELECT id, name, is_default FROM pipelines WHERE id = $1`,
      [pipelineId],
    )
    const row = rows[0]
    if (!row) throw new NotFoundException(`Pipeline ${pipelineId} not found`)
    return row
  }

  private async fetchStagesForPipeline(qr: QueryRunner, pipelineId: string): Promise<StageRow[]> {
    return sqlRows<StageRow[]>(
      qr,
      `SELECT id, pipeline_id, name, color, probability, position
       FROM pipeline_stages WHERE pipeline_id = $1 ORDER BY position ASC`,
      [pipelineId],
    )
  }

  private async insertStages(
    qr: QueryRunner,
    pipelineId: string,
    stages: StageInput[],
  ): Promise<StageRow[]> {
    if (!stages.length) return []

    return sqlRows<StageRow[]>(
      qr,
      `INSERT INTO pipeline_stages (pipeline_id, name, color, probability, position)
       SELECT $1, s.name, s.color, s.probability::int, s.position::int
       FROM jsonb_to_recordset($2::jsonb) AS s(name text, color text, probability int, position int)
       RETURNING id, pipeline_id, name, color, probability, position`,
      [pipelineId, JSON.stringify(stages)],
    )
  }
}
