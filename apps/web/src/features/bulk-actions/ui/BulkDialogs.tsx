'use client'

import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'
import { ConfirmDialog } from '@/shared/ui/molecules/confirm-dialog'

import { BulkChoiceDialogs } from './BulkChoiceDialogs'
import { BulkExportDialog } from './BulkExportDialog'
import { BulkTagsDialog } from './BulkTagsDialog'

import type { BulkActionsController } from '../model/useBulkActions'

type Dialogs = BulkActionsController['dialogs']

export function BulkDialogs({ dialogs }: Readonly<{ dialogs: Dialogs }>) {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')
  const { open, count, submit, close } = dialogs

  if (open === 'add_tags' || open === 'remove_tags') {
    return (
      <BulkTagsDialog
        mode={open}
        count={count}
        scope={open === 'remove_tags' ? (dialogs.context.tags ?? null) : null}
        onConfirm={(tags) => submit(open, { tags })}
        onClose={close}
      />
    )
  }

  if (open === 'status' || open === 'lifecycle' || open === 'assign') {
    return <BulkChoiceDialogs kind={open} count={count} onSubmit={submit} onClose={close} />
  }

  if (open === 'export') {
    return (
      <BulkExportDialog
        count={count}
        onConfirm={(params) => submit('export', params)}
        onClose={close}
      />
    )
  }

  if (open === 'restore') {
    return (
      <ConfirmDialog
        open
        onOpenChange={(next) => !next && close()}
        onConfirm={() => submit('restore')}
        copy={{
          title: t('contacts.bulk.dialogs.restore.title', { count }),
          description: t('contacts.bulk.dialogs.restore.description', {
            count,
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
      open={open === 'archive'}
      onOpenChange={(next) => !next && close()}
      onConfirm={() => submit('archive')}
      tone="destructive"
      copy={{
        title: t('contacts.bulk.dialogs.archive.title', { count }),
        description: t('contacts.bulk.dialogs.archive.description', {
          count,
          entities: terms.lowerPlural,
        }),
        warning: t('contacts.bulk.dialogs.archive.warning'),
        confirmLabel: t('contacts.bulk.dialogs.archive.confirm'),
        confirmedLabel: t('contacts.bulk.dialogs.archive.confirmed'),
        cancelLabel: t('common.cancel'),
      }}
    />
  )
}
