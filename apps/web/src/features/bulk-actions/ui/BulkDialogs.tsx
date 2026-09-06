'use client'

import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'
import { ConfirmDialog } from '@/shared/ui/molecules/confirm-dialog'

import { BulkStatusDialog } from './BulkStatusDialog'
import { BulkTagsDialog } from './BulkTagsDialog'

import type { BulkActionsController } from '../model/useBulkActions'

export function BulkDialogs({ dialogs }: Readonly<{ dialogs: BulkActionsController['dialogs'] }>) {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')

  if (dialogs.open === 'add_tags' || dialogs.open === 'remove_tags') {
    const mode = dialogs.open
    return (
      <BulkTagsDialog
        mode={mode}
        count={dialogs.count}
        onConfirm={mode === 'add_tags' ? dialogs.addTags : dialogs.removeTags}
        onClose={dialogs.close}
      />
    )
  }

  if (dialogs.open === 'status') {
    return (
      <BulkStatusDialog
        count={dialogs.count}
        onConfirm={dialogs.setStatus}
        onClose={dialogs.close}
      />
    )
  }

  if (dialogs.open === 'restore') {
    return (
      <ConfirmDialog
        open
        onOpenChange={(open) => !open && dialogs.close()}
        onConfirm={dialogs.restore}
        copy={{
          title: t('contacts.bulk.dialogs.restore.title', { count: dialogs.count }),
          description: t('contacts.bulk.dialogs.restore.description', {
            count: dialogs.count,
            entities: terms.lowerPlural,
          }),
          confirmLabel: t('contacts.bulk.dialogs.restore.confirm'),
          cancelLabel: t('common.cancel'),
        }}
      />
    )
  }

  return (
    <ConfirmDialog
      open={dialogs.open === 'archive'}
      onOpenChange={(open) => !open && dialogs.close()}
      onConfirm={dialogs.archive}
      tone="destructive"
      copy={{
        title: t('contacts.bulk.dialogs.archive.title', { count: dialogs.count }),
        description: t('contacts.bulk.dialogs.archive.description', {
          count: dialogs.count,
          entities: terms.lowerPlural,
        }),
        confirmLabel: t('contacts.bulk.dialogs.archive.confirm'),
        cancelLabel: t('common.cancel'),
      }}
    />
  )
}
