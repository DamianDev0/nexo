'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CheckIcon } from '@/shared/ui/icons'

import type { AnalyzeResult } from '@repo/shared-types'

type FileSummaryProps = {
  readonly analysis: AnalyzeResult
  readonly onRestart: () => void
}

export function FileSummary({ analysis, onRestart }: Readonly<FileSummaryProps>) {
  const { t } = useTranslation()

  return (
    <span className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
      <CheckIcon className="size-4 shrink-0 text-positive" />
      <span className="flex min-w-0 flex-1 flex-col">
        <Text variant="strong" className="truncate">
          {analysis.fileName}
        </Text>
        <Text variant="hint">
          {t('contacts.import.upload.summary', {
            rows: analysis.totalRows,
            columns: analysis.columns.length,
          })}
        </Text>
      </span>
      <PillButton variant="ghost" size="xs" onClick={onRestart}>
        {t('contacts.import.actions.changeFile')}
      </PillButton>
    </span>
  )
}
