'use client'

import { useTranslation } from 'react-i18next'

import { downloadCsv } from '@/shared/lib/download-csv'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CheckIcon } from '@/shared/ui/icons'
import { StatTile } from '@/shared/ui/molecules/stat-tile'

import { IMPORT_ISSUES_SHOWN } from '../../config/import.constants'
import { issueReportCsv } from '../../lib/import-issues'
import { IssueList } from '../IssueList'

import type { ImportIssue, ImportResult, ValidationReport } from '@repo/shared-types'

interface DoneStepProps {
  readonly result: ImportResult
  readonly report: ValidationReport | null
}

export function DoneStep({ result, report }: Readonly<DoneStepProps>) {
  const { t } = useTranslation()
  const issues: ImportIssue[] = report?.issues ?? []

  return (
    <div className="flex flex-col items-center gap-6">
      <span className="flex size-12 items-center justify-center rounded-full bg-positive-surface">
        <CheckIcon className="size-6 text-positive-text" />
      </span>

      <span className="flex flex-col items-center gap-1 text-center">
        <Text variant="lead" className="font-semibold text-foreground">
          {t('imports.done.title')}
        </Text>
        <Text variant="muted">
          {t('imports.done.subtitle', {
            total: result.imported + result.updated + result.skipped,
          })}
        </Text>
      </span>

      <span className="flex w-full gap-2">
        <StatTile centered value={result.imported} label={t('imports.result.imported')} />
        <StatTile centered value={result.updated} label={t('imports.result.updated')} />
        <StatTile centered value={result.skipped} label={t('imports.result.skipped')} />
      </span>

      {issues.length > 0 && (
        <span className="flex w-full flex-col gap-2">
          <span className="flex items-center justify-between gap-2">
            <Text variant="strong">
              {t('imports.review.needsAttention', { count: issues.length })}
            </Text>
            <PillButton
              variant="outline"
              size="xs"
              onClick={() => downloadCsv(issueReportCsv(issues), t('imports.done.reportName'))}
            >
              {t('imports.done.downloadReport')}
            </PillButton>
          </span>
          <IssueList issues={issues.slice(0, IMPORT_ISSUES_SHOWN)} />
        </span>
      )}
    </div>
  )
}
