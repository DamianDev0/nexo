import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { cn } from '@/utils'

interface WizardStepProps {
  readonly badge: string
  readonly title: string
  readonly description: string
  readonly children: React.ReactNode
  readonly aside?: React.ReactNode
  readonly onBack?: () => void
  readonly onNext: () => void
  readonly nextLabel?: string
  readonly footerNote?: string
  readonly isPending?: boolean
}

export function WizardStep({
  badge,
  title,
  description,
  children,
  aside,
  onBack,
  onNext,
  nextLabel = 'Continue',
  footerNote,
  isPending = false,
}: WizardStepProps) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="px-8 pt-8 lg:px-12 lg:pt-10">
        <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          {badge}
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Body */}
      <div
        className={cn(
          'flex-1 overflow-y-auto px-8 py-6 lg:px-12',
          aside ? 'flex flex-col gap-6 xl:flex-row xl:gap-8' : '',
        )}
      >
        <div className={aside ? 'w-full xl:max-w-md' : 'max-w-2xl'}>{children}</div>
        {aside && <div className="w-full xl:sticky xl:top-0 xl:flex-1">{aside}</div>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-card px-8 py-4 lg:px-12">
        <span className="text-xs text-muted-foreground">{footerNote}</span>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft />
              Back
            </Button>
          )}
          <Button size="sm" onClick={onNext} disabled={isPending}>
            {isPending ? 'Saving...' : nextLabel}
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
