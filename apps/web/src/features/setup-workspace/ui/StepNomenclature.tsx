import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import { LightbulbIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'

import { NOMENCLATURE_ENTITIES, NOMENCLATURE_PRESETS } from '../config/nomenclature.constants'

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

      <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-x-4 gap-y-3">
        <div />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t(`${s}.singular`)}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t(`${s}.plural`)}
        </span>

        {NOMENCLATURE_ENTITIES.map(({ key, icon: Icon }) => (
          <div key={key} className="contents">
            <div className="flex items-center gap-2">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-xs font-semibold capitalize text-muted-foreground">{key}</span>
            </div>
            <Input
              className="h-9 text-sm"
              value={data[key].singular}
              onChange={(e) => actions.onUpdate(key, 'singular', e.target.value)}
            />
            <Input
              className="h-9 text-sm"
              value={data[key].plural}
              onChange={(e) => actions.onUpdate(key, 'plural', e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">{t(`${s}.quickPresets`)}</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(NOMENCLATURE_PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => actions.onPreset(key)}
            >
              <Image src={preset.icon} alt="" width={18} height={18} className="size-4.5" />
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </WizardStep>
  )
}
