import { TAXONOMY_COLOR_PALETTE } from '@repo/shared-types'

import type { PipelineFormValues, Stage } from '../model/types'

export const PIPELINE_DEFAULT_VALUES: PipelineFormValues = {
  pipelineName: 'Sales Pipeline',
  stages: [
    { name: 'MQL', color: TAXONOMY_COLOR_PALETTE[0], probability: 10 },
    { name: 'SQL', color: TAXONOMY_COLOR_PALETTE[1], probability: 25 },
    { name: 'Demo Scheduled', color: TAXONOMY_COLOR_PALETTE[3], probability: 40 },
    { name: 'Proposal', color: TAXONOMY_COLOR_PALETTE[4], probability: 60 },
    { name: 'Negotiation', color: TAXONOMY_COLOR_PALETTE[5], probability: 80 },
    { name: 'Closed Won', color: TAXONOMY_COLOR_PALETTE[6], probability: 100 },
  ],
}

export const PIPELINE_STAGE_DEFAULT: Stage = {
  name: 'New Stage',
  color: TAXONOMY_COLOR_PALETTE[9],
  probability: 50,
}
