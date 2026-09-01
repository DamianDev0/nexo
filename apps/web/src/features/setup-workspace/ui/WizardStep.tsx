import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CaretLeftIcon, CaretRightIcon } from '@/shared/ui/icons'
import { SubmitButton } from '@/shared/ui/molecules/submit-button'

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
  readonly asideProminent?: boolean
  readonly children: ReactNode
}

export function WizardStep({
  header,
  nav,
  aside,
  asideProminent,
  children,
}: Readonly<WizardStepProps>) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-8 pt-8 lg:px-12 lg:pt-10">
        <Text
          variant="emphasis"
          className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-accent-foreground"
        >
          {header.badge}
        </Text>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">{header.title}</h1>
        <Text as="p" variant="muted" className="mt-2 max-w-lg">
          {header.description}
        </Text>
      </div>

      <div
        className={cn(
          'flex-1 overflow-y-auto px-8 py-6 lg:px-12',
          aside ? 'flex flex-col gap-6 xl:flex-row xl:gap-8' : '',
        )}
      >
        <div
          className={cn(
            aside ? 'w-full xl:max-w-md' : 'max-w-2xl',
            asideProminent && 'xl:max-w-sm',
          )}
        >
          {children}
        </div>
        {aside && <div className="w-full xl:sticky xl:top-0 xl:flex-1">{aside}</div>}
      </div>

      <div className="flex items-center justify-between border-t border-border bg-card px-8 py-4 lg:px-12">
        <Text variant="hint">{nav.footerNote}</Text>
        <div className="flex items-center gap-2">
          {nav.onBack && (
            <PillButton variant="ghost" size="xs" onClick={nav.onBack}>
              <CaretLeftIcon />
              {t('common.back')}
            </PillButton>
          )}
          <SubmitButton size="sm" onSubmit={nav.onNext} isPending={nav.isPending}>
            {nav.isPending ? t('common.saving') : (nav.nextLabel ?? t('common.continue'))}
            {!nav.isPending && <CaretRightIcon />}
          </SubmitButton>
        </div>
      </div>
    </div>
  )
}
