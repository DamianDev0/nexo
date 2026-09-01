import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { ArrowRightIcon, HouseIcon } from '@/shared/ui/icons'

interface StepDoneProps {
  readonly onGoToDashboard: () => void
  readonly onReviewConfig: () => void
}

export function StepDone({ onGoToDashboard, onReviewConfig }: Readonly<StepDoneProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.done'

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-10 text-center">
      <Image
        src="/illustrations/setup-complete.png"
        alt=""
        width={220}
        height={220}
        priority
        className="mb-4 size-55 drop-shadow-sm"
      />

      <h1 className="text-3xl font-bold tracking-tight text-foreground">{t(`${s}.title`)}</h1>
      <Text as="p" variant="muted" className="mt-3 max-w-md">
        {t(`${s}.subtitle`)}
      </Text>

      <div className="mt-8 flex gap-3">
        <PillButton variant="primary" size="md" onClick={onGoToDashboard}>
          <HouseIcon className="size-4" />
          {t(`${s}.goToDashboard`)}
        </PillButton>
        <PillButton variant="outline" size="md" onClick={onReviewConfig}>
          {t(`${s}.reviewConfig`)}
          <ArrowRightIcon className="size-4" />
        </PillButton>
      </div>

      <div className="mt-10 w-full max-w-md rounded-lg border border-primary/20 bg-accent p-5 text-left">
        <Text as="p" variant="emphasis" className="mb-3 text-primary-deep dark:text-primary">
          {t(`${s}.nextSteps`)}
        </Text>
        <ul className="flex flex-col gap-2">
          {[t(`${s}.importContacts`), t(`${s}.createFirstDeal`), t(`${s}.connectEmail`)].map(
            (tip) => (
              <li key={tip} className="flex items-center gap-2 text-xs text-foreground">
                <div className="size-1.5 shrink-0 rounded-full bg-primary" />
                {tip}
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  )
}
