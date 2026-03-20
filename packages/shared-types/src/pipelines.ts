// ─── Pipeline types ───────────────────────────────────────────────────────────

export type PipelineStage = {
  id: string
  pipelineId: string
  name: string
  color: string
  probability: number // 0–100
  position: number
}

export type Pipeline = {
  id: string
  name: string
  isDefault: boolean
  stages: PipelineStage[]
}

export type PipelineListItem = Omit<Pipeline, 'stages'> & {
  stageCount: number
}

// ─── Kanban board view ────────────────────────────────────────────────────────

export type KanbanStageSummary = PipelineStage & {
  dealCount: number
  totalValueCents: number
}

export type KanbanBoard = {
  pipeline: { id: string; name: string }
  stages: KanbanStageSummary[]
}
