'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { memo } from 'react'

import { cn } from '@/shared/lib'

import { StageRow, type Stage, type StageRowActions } from './StageRow'

interface SortableStageProps {
  readonly stage: Stage
  readonly actions: StageRowActions
}

function SortableStageBase({ stage, actions }: Readonly<SortableStageProps>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stage.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'opacity-40')}
    >
      <StageRow stage={stage} actions={actions} handle={{ attributes, listeners }} />
    </div>
  )
}

export const SortableStage = memo(SortableStageBase)
