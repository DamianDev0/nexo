'use client'

import { useTranslation } from 'react-i18next'

import { bulkActionLabel } from '@/entities/bulk-action'
import { useEntityTerms } from '@/entities/nomenclature'
import { StackIcon } from '@/shared/ui/icons'
import { ConfirmDialog } from '@/shared/ui/molecules/confirm-dialog'
import { MorphingPageDots } from '@/shared/ui/molecules/morphing-page-dots'
import { EmptyState } from '@/shared/ui/organisms/empty-state'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/shared/ui/shadcn/table'

import { useBulkHistory } from '../model/useBulkHistory'

import { BulkHistoryRow } from './BulkHistoryRow'

const COLUMNS = ['date', 'action', 'module', 'actor', 'records', 'status', 'result'] as const

export function BulkHistoryTable() {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')
  const history = useBulkHistory()
  const pending = history.revertDialog.action

  if (!history.isPending && history.total === 0) {
    return (
      <EmptyState
        fill
        icon={<StackIcon className="size-5" />}
        title={t('bulkActions.emptyTitle')}
        description={t('bulkActions.emptyDescription', { entities: terms.lowerPlural })}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableHead key={column} className={column === 'result' ? 'text-right' : undefined}>
                  {t(`bulkActions.columns.${column}`)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.rows.map((action) => (
              <BulkHistoryRow key={action.id} action={action} actions={history.rowActions} />
            ))}
          </TableBody>
        </Table>
      </div>
      <MorphingPageDots
        total={history.pagination.totalPages}
        page={history.pagination.page}
        onPageChange={history.pagination.onPageChange}
        label={t('settings.pagination.page')}
      />
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && history.revertDialog.close()}
        onConfirm={history.revertDialog.confirm}
        tone="destructive"
        copy={{
          title: t('bulkActions.revertDialog.title', {
            kind: pending ? bulkActionLabel(t, pending) : '',
          }),
          description: t('bulkActions.revertDialog.description', {
            count: pending?.succeeded ?? 0,
          }),
          confirmLabel: t('bulkActions.revertDialog.confirm'),
          confirmedLabel: t('bulkActions.revertDialog.confirmed'),
          cancelLabel: t('common.cancel'),
        }}
      />
    </div>
  )
}
