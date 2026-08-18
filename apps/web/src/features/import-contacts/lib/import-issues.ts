import type { ImportIssueFilter } from '../model/types/import.types'
import type { ImportIssue } from '@repo/shared-types'

export function filterIssues(
  issues: ReadonlyArray<ImportIssue>,
  filter: ImportIssueFilter,
): ImportIssue[] {
  if (filter === 'all') return [...issues]
  const severity = filter === 'errors' ? 'error' : 'warning'
  return issues.filter((issue) => issue.severity === severity)
}

export function issueReportCsv(issues: ReadonlyArray<ImportIssue>): string {
  const rows = issues.map((issue) =>
    [issue.row, issue.severity, issue.field ?? '', issue.message, issue.value ?? '']
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(','),
  )

  return ['row,severity,field,message,value', ...rows].join('\n')
}
