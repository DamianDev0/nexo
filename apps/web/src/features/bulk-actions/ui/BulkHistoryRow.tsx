'use client'

import { formatDateTimeCO } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import {
  BULK_STATUS_TONE,
  bulkActionLabel,
  bulkProgressPercent,
  bulkStatusLabel,
  isBulkActionActive,
  isBulkActionRevertible,
} from '@/entities/bulk-action'
import { MODULE_ENTITY, useEntityLabels } from '@/entities/nomenclature'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { Progress } from '@/shared/ui/shadcn/progress'
import { TableCell, TableRow } from '@/shared/ui/shadcn/table'

import { BulkErrorsPopover } from './BulkErrorsPopover'

import type { BulkHistoryRowActions } from '../model/useBulkHistory'
import type { BulkAction } from '@repo/shared-types'

type BulkHistoryRowProps = {
  readonly action: BulkAction
  readonly actions: BulkHistoryRowActions
}

export function BulkHistoryRow({ action, actions }: Readonly<BulkHistoryRowProps>) {
  const { t } = useTranslation()
  const entityLabel = useEntityLabels()
  const active = isBulkActionActive(action.status)

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap tabular-nums">
        {formatDateTimeCO(action.createdAt)}
      </TableCell>
      <TableCell className="font-medium">{bulkActionLabel(t, action)}</TableCell>
      <TableCell>{entityLabel(MODULE_ENTITY[action.entity] ?? 'contact', 'plural')}</TableCell>
      <TableCell>{action.createdByName ?? t('bulkActions.unknownActor')}</TableCell>
      <TableCell className="tabular-nums">
        <Text variant="body">
          {t('bulkActions.records', {
            succeeded: action.succeeded,
            failed: action.failed,
            total: action.total,
          })}
        </Text>
        {active && <Progress value={bulkProgressPercent(action)} className="mt-1 h-1.5 w-28" />}
      </TableCell>
      <TableCell>
        <BadgeSoft tone={BULK_STATUS_TONE[action.status]}>
          {bulkStatusLabel(t, action.status)}
        </BadgeSoft>
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        <span className="inline-flex items-center gap-1.5">
          {!active && <BulkErrorsPopover errors={action.errors} failed={action.failed} />}
          {action.resultFileUrl && (
            <PillButton asChild variant="outline" size="xs">
              <a href={action.resultFileUrl} target="_blank" rel="noreferrer noopener">
                {t('bulkActions.download')}
              </a>
            </PillButton>
          )}
          {isBulkActionRevertible(action) && (
            <PillButton
              variant="outline"
              size="xs"
              disabled={actions.isBusy}
              onClick={() => actions.onRevert(action)}
            >
              {t('bulkActions.revert')}
            </PillButton>
          )}
          {action.revertedAt && <BadgeSoft tone="outline">{t('bulkActions.reverted')}</BadgeSoft>}
          {active && (
            <PillButton
              variant="ghostDanger"
              size="xs"
              disabled={actions.isBusy}
              onClick={() => actions.onCancel(action.id)}
            >
              {t('bulkActions.cancel')}
            </PillButton>
          )}
        </span>
      </TableCell>
    </TableRow>
  )
}
