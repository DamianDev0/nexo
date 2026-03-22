'use client'

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Plus, X, GripVertical } from 'lucide-react'
import { sileo } from 'sileo'

import { Input } from '@/components/atoms/input'
import { Button } from '@/components/atoms/button'
import settingsService from '@/core/services/settings.service'
import { WizardStep } from './WizardStep'

interface Stage {
  readonly name: string
  readonly color: string
  readonly probability: number
}

const DEFAULT_STAGES: Stage[] = [
  { name: 'MQL', color: '#6366F1', probability: 10 },
  { name: 'SQL', color: '#8B5CF6', probability: 25 },
  { name: 'Demo Scheduled', color: '#F59E0B', probability: 40 },
  { name: 'Proposal', color: '#F97316', probability: 60 },
  { name: 'Negotiation', color: '#EF4444', probability: 80 },
  { name: 'Closed Won', color: '#059669', probability: 100 },
]

const STAGE_COLORS = [
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#F97316',
  '#EF4444',
  '#059669',
  '#0891B2',
  '#3B82F6',
  '#6B7280',
] as const

interface StepPipelineProps {
  readonly onNext: () => void
  readonly onBack: () => void
}

export function StepPipeline({ onNext, onBack }: StepPipelineProps) {
  const [pipelineName, setPipelineName] = useState('Sales Pipeline')
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES)

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      settingsService.createPipeline({
        name: pipelineName,
        isDefault: true,
        stages: stages.map((s) => ({ name: s.name, color: s.color, probability: s.probability })),
      }),
    onSuccess: () => onNext(),
    onError: (err) => sileo.error({ title: 'Failed to create pipeline', description: err.message }),
  })

  const handleAddStage = useCallback(() => {
    setStages((prev) => [...prev, { name: 'New Stage', color: '#6B7280', probability: 50 }])
  }, [])

  const handleRemoveStage = useCallback((index: number) => {
    setStages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleUpdateStage = useCallback(
    (index: number, field: keyof Stage, value: string | number) => {
      setStages((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
    },
    [],
  )

  const handleSave = useCallback(() => save(), [save])

  return (
    <WizardStep
      badge="Step 2 of 6"
      title="Design your sales pipeline"
      description="We've loaded a standard pipeline based on your industry. Customize it as you like."
      onBack={onBack}
      onNext={handleSave}
      isPending={isPending}
    >
      {/* Pipeline name */}
      <div className="mb-4">
        <Input
          className="h-10 border-border text-sm font-bold"
          value={pipelineName}
          onChange={(e) => setPipelineName(e.target.value)}
          placeholder="Pipeline name"
        />
      </div>

      {/* Stages */}
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
              onChange={(e) => handleUpdateStage(i, 'name', e.target.value)}
            />
            <div className="flex items-center gap-1.5">
              <input
                type="range"
                min={0}
                max={100}
                value={stage.probability}
                onChange={(e) =>
                  handleUpdateStage(i, 'probability', Number.parseInt(e.target.value))
                }
                className="w-20 accent-primary"
              />
              <span className="w-8 text-right text-xs font-bold text-primary">
                {stage.probability}%
              </span>
            </div>
            <button
              onClick={() => handleRemoveStage(i)}
              className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add stage */}
      <button
        onClick={handleAddStage}
        className="mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-border p-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="size-3.5" />
        Add stage
      </button>
    </WizardStep>
  )
}
