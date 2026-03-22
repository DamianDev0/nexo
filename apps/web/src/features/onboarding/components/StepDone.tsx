import { Check, Home, ArrowRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'

interface StepDoneProps {
  readonly onGoToDashboard: () => void
  readonly onReviewConfig: () => void
}

export function StepDone({ onGoToDashboard, onReviewConfig }: StepDoneProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
      {/* Success icon */}
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-100 shadow-lg shadow-emerald-100">
        <Check className="size-9 text-emerald-600" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground">Nexo is ready for you!</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        You configured your company, sales pipeline, and team. Now you can start closing deals.
      </p>

      {/* CTAs */}
      <div className="mt-8 flex gap-3">
        <Button size="lg" onClick={onGoToDashboard} className="gap-2">
          <Home className="size-4" />
          Go to Dashboard
        </Button>
        <Button variant="outline" size="lg" onClick={onReviewConfig} className="gap-2">
          Review configuration
          <ArrowRight className="size-4" />
        </Button>
      </div>

      {/* Next steps */}
      <div className="mt-10 w-full max-w-md rounded-lg border border-primary/20 bg-accent p-5 text-left">
        <p className="mb-3 text-xs font-semibold text-primary">Recommended next steps</p>
        <ul className="flex flex-col gap-2">
          {[
            'Import your contacts from a CSV',
            'Create your first deal in the pipeline',
            'Connect your email to log activities automatically',
          ].map((tip) => (
            <li key={tip} className="flex items-center gap-2 text-xs text-foreground">
              <div className="size-1.5 shrink-0 rounded-full bg-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
