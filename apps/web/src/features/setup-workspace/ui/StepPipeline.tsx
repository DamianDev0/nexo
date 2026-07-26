import { GripVertical, Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'

import { WizardStep, type WizardStepNav } from './WizardStep'

interface Stage {
  readonly id: string
  readonly name: string
  readonly color: string
  readonly probability: number
}

interface PipelineData {
  readonly pipelineName: string
  readonly stages: ReadonlyArray<Stage>
}

interface PipelineActions {
  readonly onNameChange: (v: string) => void
  readonly onAddStage: () => void
  readonly onRemoveStage: (id: string) => void
  readonly onUpdateStage: (id: string, patch: Partial<Omit<Stage, 'id'>>) => void
}

interface StepPipelineProps {
  readonly data: PipelineData
  readonly actions: PipelineActions
  readonly nav: WizardStepNav
}

export function StepPipeline({ data, actions, nav }: Readonly<StepPipelineProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.pipeline'

  return (
    <WizardStep
      header={{ badge: t(`${s}.badge`), title: t(`${s}.title`), description: t(`${s}.subtitle`) }}
      nav={nav}
    >
      <div className="mb-4">
        <Input
          className="h-10 border-border text-sm font-bold"
          value={data.pipelineName}
          onChange={(e) => actions.onNameChange(e.target.value)}
          placeholder={t(`${s}.pipelineName`)}
        />
      </div>

      <div className="flex flex-col gap-2">
        {data.stages.map((stage) => (
          <div
            key={stage.id}
            className="flex items-center gap-2 rounded-lg border border-border p-2.5"
          >
            <GripVertical className="size-4 shrink-0 text-muted-foreground" />
            <div
              className="size-5 shrink-0 rounded-full border-2 border-foreground/10"
              style={{ background: stage.color }}
            />
            <Input
              className="h-8 flex-1 border-transparent bg-transparent text-sm font-medium"
              value={stage.name}
              onChange={(e) => actions.onUpdateStage(stage.id, { name: e.target.value })}
            />
            <div className="flex items-center gap-1.5">
              <input
                type="range"
                min={0}
                max={100}
                value={stage.probability}
                onChange={(e) =>
                  actions.onUpdateStage(stage.id, { probability: Number.parseInt(e.target.value) })
                }
                className="w-20 accent-primary"
              />
              <span className="w-8 text-right text-xs font-bold text-primary">
                {stage.probability}%
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => actions.onRemoveStage(stage.id)}
              className="size-6 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={actions.onAddStage}
        className="mt-2 w-full justify-start gap-2 border-dashed p-2.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
      >
        <Plus className="size-3.5" />
        {t(`${s}.addStage`)}
      </Button>
    </WizardStep>
  )
}
