import { Check } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/utils'
import { Button } from '@/components/atoms/button'
import { Progress } from '@/components/atoms/progress'

// ─── Types ──────────────────────────────────────────────────────────

interface StepDef {
  readonly label: string
  readonly description: string
  readonly optional?: boolean
}

interface WizardLayoutProps {
  readonly steps: ReadonlyArray<StepDef>
  readonly currentStep: number
  readonly progressPercent: number
  readonly onStepClick: (step: number) => void
  readonly onSkip: () => void
  readonly children: React.ReactNode
}

// ─── Rail step item (visual only) ───────────────────────────────────

interface StepItemProps {
  readonly index: number
  readonly step: StepDef
  readonly currentStep: number
  readonly onClick: () => void
}

function StepItem({ index, step, currentStep, onClick }: StepItemProps) {
  const stepNumber = index + 1
  const isDone = stepNumber < currentStep
  const isActive = stepNumber === currentStep

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
        isActive && 'bg-accent',
        !isActive && 'hover:bg-accent/50',
      )}
    >
      <div
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
          isDone && 'border-emerald-500 bg-emerald-500 text-white',
          isActive && 'border-primary bg-primary text-primary-foreground',
          !isDone && !isActive && 'border-border text-muted-foreground',
        )}
      >
        {isDone ? <Check className="size-3.5" /> : stepNumber}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground">{step.label}</p>
        <p className="text-xs text-muted-foreground">{step.description}</p>
      </div>
      {step.optional && (
        <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
          Optional
        </span>
      )}
    </button>
  )
}

// ─── Layout ─────────────────────────────────────────────────────────

export function WizardLayout({
  steps,
  currentStep,
  progressPercent,
  onStepClick,
  onSkip,
  children,
}: WizardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left rail */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-card lg:flex">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-foreground" />
            <span className="text-xs font-bold uppercase tracking-widest text-foreground">
              Nexo
            </span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={onSkip}
          >
            Skip setup →
          </Button>
        </div>

        {/* Progress + steps */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div>
            <h2 className="text-sm font-bold text-foreground">Configure your workspace</h2>
            <p className="mt-1 text-xs text-muted-foreground">Takes less than 5 minutes.</p>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {currentStep} of {steps.length}
              </span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>

          {/* Steps */}
          <nav className="flex flex-col gap-1">
            {steps.map((step, i) => (
              <StepItem
                key={step.label}
                index={i}
                step={step}
                currentStep={currentStep}
                onClick={() => onStepClick(i + 1)}
              />
            ))}
          </nav>
        </div>

        {/* Help box */}
        <div className="border-t border-border p-5">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-semibold text-foreground">Need help?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Our team can guide you through the initial setup.
            </p>
            <a href="#" className="mt-2 inline-block text-xs font-semibold text-primary">
              Chat with support →
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-6 lg:hidden">
          <span className="text-xs font-bold uppercase tracking-widest text-foreground">Nexo</span>
          <span className="text-xs text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
        </div>

        {children}
      </main>
    </div>
  )
}
