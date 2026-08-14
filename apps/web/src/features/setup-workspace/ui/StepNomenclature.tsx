import { useTranslation } from 'react-i18next'

import { LightbulbIcon } from '@/shared/ui/icons'

import { NomenclatureFields } from './nomenclature/NomenclatureFields'
import { WizardStep, type WizardStepNav } from './WizardStep'

import type { TenantNomenclature } from '@repo/shared-types'

interface NomenclatureActions {
  readonly onUpdate: (
    entity: keyof TenantNomenclature,
    field: 'singular' | 'plural',
    value: string,
  ) => void
  readonly onPreset: (key: string) => void
}

interface StepNomenclatureProps {
  readonly data: TenantNomenclature
  readonly actions: NomenclatureActions
  readonly nav: WizardStepNav
}

export function StepNomenclature({ data, actions, nav }: Readonly<StepNomenclatureProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.nomenclature'

  return (
    <WizardStep
      header={{ badge: t(`${s}.badge`), title: t(`${s}.title`), description: t(`${s}.subtitle`) }}
      nav={{ ...nav, footerNote: t(`${s}.canChangeAnytime`) }}
    >
      <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-card py-2 pl-3 pr-4 text-xs text-muted-foreground shadow-xs">
        <LightbulbIcon className="size-3.5 shrink-0 text-primary" />
        {t(`${s}.hint`)}
      </div>

      <NomenclatureFields data={data} onUpdate={actions.onUpdate} onPreset={actions.onPreset} />
    </WizardStep>
  )
}
