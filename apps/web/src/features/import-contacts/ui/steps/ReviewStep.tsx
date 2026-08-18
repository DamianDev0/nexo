'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Note } from '@/shared/ui/atoms/note'
import { SegmentedControl } from '@/shared/ui/molecules/segmented-control'

import { IMPORT_ISSUES_SHOWN, IMPORT_ISSUE_FILTERS } from '../../config/import-contacts.constants'
import { filterIssues } from '../../lib/import-issues'
import { IssueList } from '../IssueList'
import { StatTile } from '../StatTile'

import type { ImportIssueFilter } from '../../model/types/import.types'
import type { DuplicateStrategy, ValidationReport } from '@repo/shared-types'

interface ReviewStepProps {
  readonly report: ValidationReport
  readonly strategy: DuplicateStrategy
}

export function ReviewStep({ report, strategy }: Readonly<ReviewStepProps>) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<ImportIssueFilter>('all')

  const issues = filterIssues(report.issues, filter)

  return (
    <div className="flex flex-col gap-5">
      <span className="flex gap-2">
        <StatTile value={report.readyRows} label={t('contacts.import.review.ready')} tone="ready" />
        <StatTile
          value={report.warningRows}
          label={t('contacts.import.review.warnings')}
          tone="warning"
        />
        <StatTile
          value={report.errorRows}
          label={t('contacts.import.review.errors')}
          tone="error"
        />
      </span>

      <Note>
        {t(`contacts.import.review.${strategy}Summary`, {
          ready: report.readyRows,
          errors: report.errorRows,
        })}
      </Note>

      {report.issues.length > 0 && (
        <span className="flex flex-col gap-2">
          <SegmentedControl
            value={filter}
            onValueChange={setFilter}
            options={IMPORT_ISSUE_FILTERS.map((option) => ({
              value: option,
              label: t(`contacts.import.review.filters.${option}`),
            }))}
            className="self-start"
          />

          <IssueList issues={issues.slice(0, IMPORT_ISSUES_SHOWN)} />

          {(issues.length > IMPORT_ISSUES_SHOWN || report.truncatedIssues) && (
            <span className="text-xs text-faint">
              {t('contacts.import.review.truncated', {
                shown: Math.min(issues.length, IMPORT_ISSUES_SHOWN),
              })}
            </span>
          )}
        </span>
      )}
    </div>
  )
}
