export interface Stage {
  name: string
  color: string
  probability: number
}

export interface PipelineFormValues {
  pipelineName: string
  stages: Stage[]
}
