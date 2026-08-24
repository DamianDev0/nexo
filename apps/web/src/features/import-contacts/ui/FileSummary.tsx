'use client'

import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { CheckIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'

import type { AnalyzeResult } from '@repo/shared-types'

interface FileSummaryProps {
  readonly analysis: AnalyzeResult
  readonly onRestart: () => void
}

export function FileSummary({ analysis, onRestart }: Readonly<FileSummaryProps>) {
  const { t } = useTranslation()

  return (
    <span className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
      <CheckIcon className="size-4 shrink-0 text-positive" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{analysis.fileName}</span>
        <Text variant="hint">
          {t('contacts.import.upload.summary', {
            rows: analysis.totalRows,
            columns: analysis.columns.length,
          })}
        </Text>
      </span>
      <Button variant="ghost" size="sm" onClick={onRestart}>
        {t('contacts.import.actions.changeFile')}
      </Button>
    </span>
  )
}
