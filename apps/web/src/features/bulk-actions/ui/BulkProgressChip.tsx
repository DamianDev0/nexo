'use client'

import { useTranslation } from 'react-i18next'

import { bulkKindLabel, bulkProgressPercent } from '@/entities/bulk-action'
import { Text } from '@/shared/ui/atoms/text'
import { Progress } from '@/shared/ui/shadcn/progress'

import type { BulkAction } from '@repo/shared-types'

export function BulkProgressChip({ action }: Readonly<{ action: BulkAction }>) {
  const { t } = useTranslation()

  return (
    <span className="flex items-center gap-2 pl-1">
      <Progress value={bulkProgressPercent(action)} className="h-1.5 w-20" />
      <Text variant="faint" className="tabular-nums">
        {bulkKindLabel(t, action.action)} ·{' '}
        {t('contacts.bulk.progress', { processed: action.processed, total: action.total })}
      </Text>
    </span>
  )
}
