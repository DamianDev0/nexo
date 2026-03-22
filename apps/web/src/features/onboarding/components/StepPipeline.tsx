import { useTranslation } from 'react-i18next'
import { Plus, X, GripVertical } from 'lucide-react'

import { Input } from '@/components/atoms/input'
import { WizardStep } from './WizardStep'

interface Stage {
  readonly name: string
  readonly color: string
  readonly probability: number
}

interface StepPipelineProps {
  readonly pipelineName: string
  readonly stages: ReadonlyArray<Stage>
  readonly isPending: boolean
  readonly onPipelineNameChange: (v: string) => void
  readonly onAddStage: () => void
  readonly onRemoveStage: (index: number) => void
  readonly onUpdateStage: (
    index: number,
    field: 'name' | 'color' | 'probability',
    value: string | number,
  ) => void
  readonly onNext: () => void
  readonly onBack: () => void
}

export function StepPipeline({
  pipelineName,
  stages,
  isPending,
  onPipelineNameChange,
  onAddStage,
  onRemoveStage,
  onUpdateStage,
  onNext,
  onBack,
}: StepPipelineProps) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.pipeline'

  return (
    <WizardStep
      badge={t(`${s}.badge`)}
      title={t(`${s}.title`)}
      description={t(`${s}.subtitle`)}
      onBack={onBack}
      onNext={onNext}
      isPending={isPending}
    >
      <div className="mb-4">
        <Input
          className="h-10 border-border text-sm font-bold"
          value={pipelineName}
          onChange={(e) => onPipelineNameChange(e.target.value)}
          placeholder={t(`${s}.pipelineName`)}
        />
      </div>

      <div className="flex flex-col gap-2">
        {stages.map((stage, i) => (
          <div
            key={`stage-${i}-${stage.name}`}
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
              onChange={(e) => onUpdateStage(i, 'name', e.target.value)}
            />
            <div className="flex items-center gap-1.5">
              <input
                type="range"
                min={0}
                max={100}
                value={stage.probability}
                onChange={(e) => onUpdateStage(i, 'probability', Number.parseInt(e.target.value))}
                className="w-20 accent-primary"
              />
              <span className="w-8 text-right text-xs font-bold text-primary">
                {stage.probability}%
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRemoveStage(i)}
              className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddStage}
        className="mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-border p-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="size-3.5" />
        {t(`${s}.addStage`)}
      </button>
    </WizardStep>
  )
}
