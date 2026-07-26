import { Check } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui/shadcn/button'
import { Progress } from '@/shared/ui/shadcn/progress'

import type { ReactNode } from 'react'

export interface StepDef {
  readonly label: string
  readonly description: string
  readonly optional?: boolean
}

export interface WizardRail {
  readonly steps: ReadonlyArray<StepDef>
  readonly currentStep: number
  readonly progressPercent: number
  readonly onStepClick: (step: number) => void
  readonly onSkip: () => void
}

interface StepItemProps {
  readonly index: number
  readonly step: StepDef
  readonly currentStep: number
  readonly onClick: () => void
}

function StepItem({ index, step, currentStep, onClick }: Readonly<StepItemProps>) {
  const { t } = useTranslation()
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
          {t('common.optional')}
        </span>
      )}
    </button>
  )
}

interface WizardLayoutProps {
  readonly rail: WizardRail
  readonly children: ReactNode
}

export function WizardLayout({ rail, children }: Readonly<WizardLayoutProps>) {
  const { t } = useTranslation()
  const stepOf = t('onboarding.stepOf', {
    current: rail.currentStep,
    total: rail.steps.length,
  })

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-card lg:flex">
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
            onClick={rail.onSkip}
          >
            {t('onboarding.skipSetup')}
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              {t('onboarding.configureWorkspace')}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('onboarding.takesLessThan5Min')}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('onboarding.progress')}</span>
              <span>{stepOf}</span>
            </div>
            <Progress value={rail.progressPercent} className="h-1.5" />
          </div>

          <nav className="flex flex-col gap-1">
            {rail.steps.map((step, i) => (
              <StepItem
                key={step.label}
                index={i}
                step={step}
                currentStep={rail.currentStep}
                onClick={() => rail.onStepClick(i + 1)}
              />
            ))}
          </nav>
        </div>

        <div className="border-t border-border p-5">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-semibold text-foreground">{t('onboarding.needHelp')}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t('onboarding.helpDescription')}</p>
            <Link href="#" className="mt-2 inline-block text-xs font-semibold text-primary">
              {t('onboarding.chatSupport')}
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-14 items-center justify-between border-b border-border px-6 lg:hidden">
          <span className="text-xs font-bold uppercase tracking-widest text-foreground">Nexo</span>
          <span className="text-xs text-muted-foreground">{stepOf}</span>
        </div>

        {children}
      </main>
    </div>
  )
}
