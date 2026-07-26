import { BRAND_COLOR_OPTIONS } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'

import { NOMENCLATURE_PRESETS, type NomenclatureState } from '../model/useStepNomenclature'

import { WizardStep, type WizardStepNav } from './WizardStep'

const ENTITY_COLORS = {
  contact: BRAND_COLOR_OPTIONS[0],
  company: BRAND_COLOR_OPTIONS[7],
  deal: BRAND_COLOR_OPTIONS[6],
  activity: BRAND_COLOR_OPTIONS[5],
} as const

interface NomenclatureActions {
  readonly onUpdate: (
    entity: keyof NomenclatureState,
    field: 'singular' | 'plural',
    value: string,
  ) => void
  readonly onPreset: (key: string) => void
}

interface StepNomenclatureProps {
  readonly data: NomenclatureState
  readonly actions: NomenclatureActions
  readonly nav: WizardStepNav
}

export function StepNomenclature({ data, actions, nav }: StepNomenclatureProps) {
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

        {(Object.keys(data) as Array<keyof NomenclatureState>).map((entity) => (
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
