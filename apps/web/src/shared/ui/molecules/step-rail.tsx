'use client'

import { cn } from '@/shared/lib'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { Text } from '@/shared/ui/atoms/text'
import { CheckIcon } from '@/shared/ui/icons'

export type StepRailStep = {
  readonly label: string
  readonly description?: string
  readonly optional?: boolean
}

type StepRailProps = {
  readonly steps: ReadonlyArray<StepRailStep>
  readonly currentStep: number
  readonly onStepClick: (step: number) => void
  readonly optionalLabel?: string
}

export function StepRail({
  steps,
  currentStep,
  onStepClick,
  optionalLabel,
}: Readonly<StepRailProps>) {
  return (
    <nav className="flex flex-col gap-1">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isDone = stepNumber < currentStep
        const isActive = stepNumber === currentStep
        return (
          <button
            key={step.label}
            type="button"
            aria-current={isActive ? 'step' : undefined}
            onClick={() => onStepClick(stepNumber)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
              isActive && 'bg-accent',
              !isActive && 'hover:bg-accent/50',
            )}
          >
            <div
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                (isDone || isActive) && 'border-primary bg-primary text-primary-foreground',
                !isDone && !isActive && 'border-border text-muted-foreground',
              )}
            >
              {isDone ? <CheckIcon className="size-3.5" /> : stepNumber}
            </div>
            <div className="min-w-0 flex-1">
              <Text as="p" variant="emphasis">
                {step.label}
              </Text>
              {step.description && (
                <Text as="p" variant="hint">
                  {step.description}
                </Text>
              )}
            </div>
            {step.optional && optionalLabel && (
              <BadgeSoft tone="outline" className="h-5 shrink-0 px-2 text-xs">
                {optionalLabel}
              </BadgeSoft>
            )}
          </button>
        )
      })}
    </nav>
  )
}
