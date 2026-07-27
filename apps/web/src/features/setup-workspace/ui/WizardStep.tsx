import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui/shadcn/button'

import type { ReactNode } from 'react'

export interface WizardStepHeader {
  readonly badge: string
  readonly title: string
  readonly description: string
}

export interface WizardStepNav {
  readonly onNext: () => void
  readonly onBack?: () => void
  readonly nextLabel?: string
  readonly footerNote?: string
  readonly isPending?: boolean
}

interface WizardStepProps {
  readonly header: WizardStepHeader
  readonly nav: WizardStepNav
  readonly aside?: ReactNode
  readonly children: ReactNode
}

export function WizardStep({ header, nav, aside, children }: Readonly<WizardStepProps>) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-8 pt-8 lg:px-12 lg:pt-10">
        <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          {header.badge}
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">{header.title}</h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">{header.description}</p>
      </div>

      <div
        className={cn(
          'flex-1 overflow-y-auto px-8 py-6 lg:px-12',
          aside ? 'flex flex-col gap-6 xl:flex-row xl:gap-8' : '',
        )}
      >
        <div className={aside ? 'w-full xl:max-w-md' : 'max-w-2xl'}>{children}</div>
        {aside && <div className="w-full xl:sticky xl:top-0 xl:flex-1">{aside}</div>}
      </div>

      <div className="flex items-center justify-between border-t border-border bg-card px-8 py-4 lg:px-12">
        <span className="text-xs text-muted-foreground">{nav.footerNote}</span>
        <div className="flex items-center gap-2">
          {nav.onBack && (
            <Button variant="ghost" size="sm" onClick={nav.onBack}>
              <ChevronLeft />
              {t('common.back')}
            </Button>
          )}
          <Button size="sm" onClick={nav.onNext} disabled={nav.isPending}>
            {nav.isPending ? t('common.saving') : (nav.nextLabel ?? t('common.continue'))}
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
