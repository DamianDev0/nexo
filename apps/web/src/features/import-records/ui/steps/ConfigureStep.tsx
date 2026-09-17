'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { Note } from '@/shared/ui/atoms/note'
import { Text } from '@/shared/ui/atoms/text'
import { CheckIcon } from '@/shared/ui/icons'
import { OptionTile } from '@/shared/ui/molecules/option-tile'

import { IMPORT_STRATEGIES } from '../../config/import.constants'
import { useImportDescriptor } from '../../model/useImportDescriptor'
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
  const { config, terms } = useImportDescriptor()
  const names = { entity: terms.singular, entities: terms.plural }

  return (
    <div className="flex flex-col gap-6">
      <FileSummary analysis={analysis} onRestart={onRestart} />

      <fieldset className="flex flex-col gap-2">
        <legend className="pb-2 text-sm font-medium text-foreground">
          {t('imports.strategy.title', names)}
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
                <Text variant="strong">{t(`imports.strategy.${option}`)}</Text>
                <Text variant="hint">{t(`imports.strategy.${option}Hint`, names)}</Text>
              </span>
            </OptionTile>
          )
        })}
      </fieldset>

      <Note>{t(config.matchNoteKey, names)}</Note>
    </div>
  )
}
