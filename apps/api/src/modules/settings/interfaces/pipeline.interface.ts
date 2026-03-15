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
