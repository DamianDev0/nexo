'use client'

import { useTranslation } from 'react-i18next'

import { downloadCsv } from '@/shared/lib/download-csv'
import { CheckIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'

import { IMPORT_ISSUES_SHOWN } from '../../config/import-contacts.constants'
import { issueReportCsv } from '../../lib/import-issues'
import { IssueList } from '../IssueList'
import { StatTile } from '../StatTile'

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
        <span className="text-lg font-semibold text-foreground">
          {t('contacts.import.done.title')}
        </span>
        <span className="text-sm text-muted-foreground">
          {t('contacts.import.done.subtitle', {
            total: result.imported + result.updated + result.skipped,
          })}
        </span>
      </span>

      <span className="flex w-full gap-2">
        <StatTile centered value={result.imported} label={t('contacts.import.result.imported')} />
        <StatTile centered value={result.updated} label={t('contacts.import.result.updated')} />
        <StatTile centered value={result.skipped} label={t('contacts.import.result.skipped')} />
      </span>

      {issues.length > 0 && (
        <span className="flex w-full flex-col gap-2">
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">
              {t('contacts.import.review.needsAttention', { count: issues.length })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadCsv(issueReportCsv(issues), t('contacts.import.done.reportName'))
              }
            >
              {t('contacts.import.done.downloadReport')}
            </Button>
          </span>
          <IssueList issues={issues.slice(0, IMPORT_ISSUES_SHOWN)} />
        </span>
      )}
    </div>
  )
}
