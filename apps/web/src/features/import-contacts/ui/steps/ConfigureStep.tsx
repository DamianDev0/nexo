'use client'

import { useTranslation } from 'react-i18next'

import { useEntityLabels } from '@/entities/nomenclature'
import { cn } from '@/shared/lib/cn'
import { Note } from '@/shared/ui/atoms/note'
import { Text } from '@/shared/ui/atoms/text'
import { CheckIcon } from '@/shared/ui/icons'
import { OptionTile } from '@/shared/ui/molecules/option-tile'

import { IMPORT_STRATEGIES } from '../../config/import-contacts.constants'
import { FileSummary } from '../FileSummary'

import type { AnalyzeResult, DuplicateStrategy } from '@repo/shared-types'

interface ConfigureStepProps {
  readonly analysis: AnalyzeResult
  readonly strategy: DuplicateStrategy
  readonly onStrategy: (strategy: DuplicateStrategy) => void
  readonly onRestart: () => void
}

export function ConfigureStep({
  analysis,
  strategy,
  onStrategy,
  onRestart,
}: Readonly<ConfigureStepProps>) {
  const { t } = useTranslation()
  const entityLabel = useEntityLabels()
  const names = {
    entity: entityLabel('contact', 'singular'),
    entities: entityLabel('contact', 'plural'),
  }

  return (
    <div className="flex flex-col gap-6">
      <FileSummary analysis={analysis} onRestart={onRestart} />

      <fieldset className="flex flex-col gap-2">
        <legend className="pb-2 text-sm font-medium text-foreground">
          {t('contacts.import.strategy.title', names)}
        </legend>

        {IMPORT_STRATEGIES.map((option) => {
          const isActive = option === strategy

          return (
            <OptionTile
              key={option}
              selected={isActive}
              onSelect={() => onStrategy(option)}
              className="flex items-start gap-3 p-4 text-left"
            >
              <span
                className={cn(
                  'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border',
                  isActive ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                )}
              >
                {isActive && <CheckIcon className="size-2.5" />}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <Text variant="strong">{t(`contacts.import.strategy.${option}`)}</Text>
                <Text variant="hint">{t(`contacts.import.strategy.${option}Hint`, names)}</Text>
              </span>
            </OptionTile>
          )
        })}
      </fieldset>

      <Note>{t('contacts.import.strategy.matchNote', names)}</Note>
    </div>
  )
}
