import type { KanbanStageSummary, Pipeline, PipelineStage } from '@repo/shared-types'
import type { KanbanStageRow, PipelineRow, StageRow } from '../interfaces/pipeline.interface'

export function mapStage(s: StageRow): PipelineStage {
  return {
    id: s.id,
    pipelineId: s.pipeline_id,
    name: s.name,
    color: s.color,
    probability: s.probability,
    position: s.position,
  }
}

export function buildPipeline(p: PipelineRow, stages: PipelineStage[]): Pipeline {
  return { id: p.id, name: p.name, isDefault: p.is_default, stages }
}

export function buildPipelineList(pipelines: PipelineRow[], stages: StageRow[]): Pipeline[] {
  const stagesByPipeline = new Map<string, PipelineStage[]>()
  for (const s of stages) {
    const arr = stagesByPipeline.get(s.pipeline_id) ?? []
    arr.push(mapStage(s))
    stagesByPipeline.set(s.pipeline_id, arr)
  }

  return pipelines.map((p): Pipeline => buildPipeline(p, stagesByPipeline.get(p.id) ?? []))
}

export function mapKanbanStage(r: KanbanStageRow): KanbanStageSummary {
  return {
    id: r.id,
    pipelineId: r.pipeline_id,
    name: r.name,
    color: r.color,
    probability: r.probability,
    position: r.position,
    dealCount: Number(r.deal_count),
    totalValueCents: Number(r.total_value_cents),
  }
}
