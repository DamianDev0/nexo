import { BRAND_COLOR_OPTIONS } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'

import { NOMENCLATURE_PRESETS } from '../model/nomenclature.constants'

import { WizardStep, type WizardStepNav } from './WizardStep'

import type { TenantNomenclature } from '@repo/shared-types'

const ENTITY_COLORS = {
  contact: BRAND_COLOR_OPTIONS[0].hex,
  company: BRAND_COLOR_OPTIONS[7].hex,
  deal: BRAND_COLOR_OPTIONS[6].hex,
  activity: BRAND_COLOR_OPTIONS[5].hex,
} as const

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
      <div className="mb-6 rounded-lg border border-primary/20 bg-accent p-3 text-xs text-foreground">
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

        {(Object.keys(data) as Array<keyof TenantNomenclature>).map((entity) => (
          <div key={entity} className="contents">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full" style={{ background: ENTITY_COLORS[entity] }} />
              <span className="text-xs font-semibold capitalize text-muted-foreground">
                {entity}
              </span>
            </div>
            <Input
              className="h-9 border-border text-sm"
              value={data[entity].singular}
              onChange={(e) => actions.onUpdate(entity, 'singular', e.target.value)}
            />
            <Input
              className="h-9 border-border text-sm"
              value={data[entity].plural}
              onChange={(e) => actions.onUpdate(entity, 'plural', e.target.value)}
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
              className="text-xs"
              onClick={() => actions.onPreset(key)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </WizardStep>
  )
}
