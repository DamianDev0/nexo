'use client'

import { memo } from 'react'

import { SortableRow } from '@/shared/ui/molecules/sortable-row'

import { StageRow, type Stage, type StageRowActions } from './StageRow'

interface SortableStageProps {
  readonly stage: Stage
  readonly actions: StageRowActions
}

function SortableStageBase({ stage, actions }: Readonly<SortableStageProps>) {
  return (
    <SortableRow id={stage.id}>
      {(handle) => <StageRow stage={stage} actions={actions} handle={handle} />}
    </SortableRow>
  )
}

export const SortableStage = memo(SortableStageBase)
