'use client'

import { useTranslation } from 'react-i18next'

import { openDealCount, useLinkedDeals } from '@/entities/deal'
import { useEntityTerms } from '@/entities/nomenclature'
import { useObjectDescriptor } from '@/entities/object-descriptor'
import { ConfirmDialog } from '@/shared/ui/molecules/confirm-dialog'

import { buildArchiveCopy } from '../../lib/archive-copy'

import type { RecordBase } from '@/entities/object-descriptor'

type ArchiveDialogControl = {
  readonly target: RecordBase | null
  readonly close: () => void
  readonly confirm: () => void
}

type ArchiveDialogBodyProps = {
  readonly record: RecordBase
  readonly state: ArchiveDialogControl
}

function ArchiveDialogBody({ record, state }: Readonly<ArchiveDialogBodyProps>) {
  const { t } = useTranslation()
  const descriptor = useObjectDescriptor()
  const terms = useEntityTerms(descriptor.type)
  const dealTerms = useEntityTerms('deal')
  const { deals } = useLinkedDeals(descriptor.dealLink(record.id))

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) state.close()
      }}
      onConfirm={state.confirm}
      copy={buildArchiveCopy(t, {
        name: descriptor.displayName(record),
        entity: terms.lowerSingular,
        deals: dealTerms.lowerPlural,
        openDeals: openDealCount(deals),
      })}
    />
  )
}

type ArchiveRecordDialogProps = {
  readonly state: ArchiveDialogControl
}

export function ArchiveRecordDialog({ state }: Readonly<ArchiveRecordDialogProps>) {
  if (!state.target) return null

  return <ArchiveDialogBody record={state.target} state={state} />
}
