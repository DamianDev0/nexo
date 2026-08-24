'use client'

import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useDndReorder } from '@/shared/lib/hooks/useDndReorder'
import { PlusIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { SortableStage } from './pipeline/SortableStage'
import { StageRow, type Stage } from './pipeline/StageRow'
import { WizardStep, type WizardStepNav } from './WizardStep'

interface PipelineData {
  readonly pipelineName: string
  readonly stages: ReadonlyArray<Stage>
}

interface PipelineActions {
  readonly onNameChange: (v: string) => void
  readonly onAddStage: () => void
  readonly onRemoveStage: (id: string) => void
  readonly onUpdateStage: (id: string, patch: Partial<Omit<Stage, 'id'>>) => void
  readonly onReorderStages: (activeId: string, overId: string) => void
}

interface StepPipelineProps {
  readonly data: PipelineData
  readonly actions: PipelineActions
  readonly nav: WizardStepNav
}

export function StepPipeline({ data, actions, nav }: Readonly<StepPipelineProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.pipeline'
  const dnd = useDndReorder(actions.onReorderStages)

  const activeStage = dnd.activeId ? data.stages.find((st) => st.id === dnd.activeId) : null
  const rowActions = useMemo(
    () => ({ onUpdate: actions.onUpdateStage, onRemove: actions.onRemoveStage }),
    [actions.onUpdateStage, actions.onRemoveStage],
  )

  return (
    <WizardStep
      header={{ badge: t(`${s}.badge`), title: t(`${s}.title`), description: t(`${s}.subtitle`) }}
      nav={nav}
    >
      <div className="mb-4">
        <Input
          className="h-10 text-sm font-bold"
          value={data.pipelineName}
          onChange={(e) => actions.onNameChange(e.target.value)}
          placeholder={t(`${s}.pipelineName`)}
          aria-label={t(`${s}.pipelineName`)}
        />
      </div>

      <DndContext
        id="wizard-pipeline-dnd"
        sensors={dnd.sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragStart={dnd.handleDragStart}
        onDragEnd={dnd.handleDragEnd}
        onDragCancel={dnd.handleDragCancel}
      >
        <SortableContext
          items={data.stages.map((st) => st.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {data.stages.map((stage) => (
              <SortableStage key={stage.id} stage={stage} actions={rowActions} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay modifiers={[restrictToVerticalAxis]}>
          {activeStage ? <StageRow stage={activeStage} actions={rowActions} ghost /> : null}
        </DragOverlay>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        onClick={actions.onAddStage}
        className="mt-2 w-full justify-start gap-2 border-dashed p-2.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary-deep dark:hover:text-primary"
      >
        <PlusIcon className="size-3.5" />
        {t(`${s}.addStage`)}
      </Button>
    </WizardStep>
  )
}
