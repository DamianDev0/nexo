'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { Text } from '@/shared/ui/atoms/text'
import { WarningCircleIcon, XIcon } from '@/shared/ui/icons'
import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'
import { Table, TableBody, TableCell, TableRow } from '@/shared/ui/shadcn/table'

import type { ImportIssue } from '@repo/shared-types'

export function IssueList({ issues }: Readonly<{ issues: ReadonlyArray<ImportIssue> }>) {
  const { t } = useTranslation()

  if (issues.length === 0) {
    return (
      <Text as="p" variant="hint" className="rounded-lg border border-border px-3 py-6 text-center">
        {t('contacts.import.review.noIssues')}
      </Text>
    )
  }

  return (
    <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
      <Table>
        <TableBody>
          {issues.map((issue) => (
            <TableRow
              key={`${issue.row}-${issue.field ?? ''}-${issue.message}`}
              className="hover:bg-transparent"
            >
              <TableCell className="w-10">
                <span
                  className={cn(
                    'flex',
                    issue.severity === 'error' ? 'text-negative' : 'text-warning-deep',
                  )}
                >
                  {issue.severity === 'error' ? (
                    <XIcon className="size-3.5" />
                  ) : (
                    <WarningCircleIcon className="size-3.5" />
                  )}
                </span>
              </TableCell>

              <TableCell className="max-w-96">
                <TruncateTip className="text-body">{issue.message}</TruncateTip>
              </TableCell>

              <TableCell className="max-w-48">
                <TruncateTip className="text-xs text-muted-foreground">
                  {issue.value ?? ''}
                </TruncateTip>
              </TableCell>

              <TableCell className="w-20 text-right text-xs tabular-nums text-faint">
                {t('contacts.import.review.row', { row: issue.row })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
