export interface PipelineRow {
  id: string
  name: string
  is_default: boolean
}
export interface StageRow {
  id: string
  pipeline_id: string
  name: string
  color: string
  probability: number
  position: number
}

export interface KanbanStageRow extends StageRow {
  deal_count: string // COUNT → string from pg
  total_value_cents: string // SUM → string from pg
}
