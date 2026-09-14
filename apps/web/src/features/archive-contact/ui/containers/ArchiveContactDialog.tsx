'use client'

import { useTranslation } from 'react-i18next'

import { contactFullName } from '@/entities/contact'
import { openDealCount, useContactDeals } from '@/entities/deal'
import { useEntityTerms } from '@/entities/nomenclature'
import { ConfirmDialog } from '@/shared/ui/molecules/confirm-dialog'

import { buildArchiveCopy } from '../../lib/archive-copy'

import type { ArchiveContactDialogState } from '../../model/useArchiveContactDialog'
import type { ContactListItem } from '@repo/shared-types'

type ArchiveDialogBodyProps = {
  readonly contact: ContactListItem
  readonly state: ArchiveContactDialogState
}

function ArchiveDialogBody({ contact, state }: Readonly<ArchiveDialogBodyProps>) {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')
  const { deals } = useContactDeals(contact.id)

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => {
        if (!open) state.close()
      }}
      onConfirm={state.confirm}
      copy={buildArchiveCopy(t, {
        name: contactFullName(contact),
        entity: terms.lowerSingular,
        openDeals: openDealCount(deals),
      })}
    />
  )
}

type ArchiveContactDialogProps = {
  readonly state: ArchiveContactDialogState
}

export function ArchiveContactDialog({ state }: Readonly<ArchiveContactDialogProps>) {
  if (!state.target) return null

  return <ArchiveDialogBody contact={state.target} state={state} />
}
