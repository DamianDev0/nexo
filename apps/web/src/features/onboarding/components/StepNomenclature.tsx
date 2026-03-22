import { useTranslation } from 'react-i18next'

import { Input } from '@/components/atoms/input'
import { Button } from '@/components/atoms/button'
import { WizardStep } from './WizardStep'
import { NOMENCLATURE_PRESETS, type NomenclatureState } from '../hooks/useStepNomenclature'

const ENTITY_COLORS = {
  contact: '#4F46E5',
  company: '#0891B2',
  deal: '#059669',
  activity: '#D97706',
} as const

interface StepNomenclatureProps {
  readonly nomen: NomenclatureState
  readonly isPending: boolean
  readonly onUpdate: (
    entity: keyof NomenclatureState,
    field: 'singular' | 'plural',
    value: string,
  ) => void
  readonly onPreset: (key: string) => void
  readonly onNext: () => void
  readonly onBack: () => void
}

export function StepNomenclature({
  nomen,
  isPending,
  onUpdate,
  onPreset,
  onNext,
  onBack,
}: StepNomenclatureProps) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.nomenclature'

  return (
    <WizardStep
      badge={t(`${s}.badge`)}
      title={t(`${s}.title`)}
      description={t(`${s}.subtitle`)}
      onBack={onBack}
      onNext={onNext}
      isPending={isPending}
      footerNote={t(`${s}.canChangeAnytime`)}
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

        {(Object.keys(nomen) as Array<keyof NomenclatureState>).map((entity) => (
          <div key={entity} className="contents">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full" style={{ background: ENTITY_COLORS[entity] }} />
              <span className="text-xs font-semibold capitalize text-muted-foreground">
                {entity}
              </span>
            </div>
            <Input
              className="h-9 border-border text-sm"
              value={nomen[entity].singular}
              onChange={(e) => onUpdate(entity, 'singular', e.target.value)}
            />
            <Input
              className="h-9 border-border text-sm"
              value={nomen[entity].plural}
              onChange={(e) => onUpdate(entity, 'plural', e.target.value)}
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
              onClick={() => onPreset(key)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </WizardStep>
  )
}
