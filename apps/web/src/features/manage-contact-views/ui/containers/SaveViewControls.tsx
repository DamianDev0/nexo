'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { BookmarkIcon, PencilSimpleIcon, TrashIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import { buildViewInput, isSnapshotDirty, type ViewSnapshot } from '../../lib/view-snapshot'
import { useContactViewsAdmin } from '../../query/useContactViewsAdmin'
import { DeleteViewDialog } from '../DeleteViewDialog'
import { SaveViewDialog } from '../SaveViewDialog'

import type { ViewFormValues } from '../../lib/view-form.schema'
import type { ContactView } from '@repo/shared-types'

type SaveViewControlsProps = {
  readonly snapshot: ViewSnapshot
  readonly activeView: ContactView | null
}

export function SaveViewControls({ snapshot, activeView }: Readonly<SaveViewControlsProps>) {
  const { t } = useTranslation()
  const views = useContactViewsAdmin()
  const [dialog, setDialog] = useState<'create' | 'edit' | 'delete' | null>(null)

  if (!activeView && !isSnapshotDirty(snapshot)) return null

  const submit = (meta: ViewFormValues) => {
    if (dialog === 'edit' && activeView) {
      views.update({ id: activeView.id, data: buildViewInput(meta, snapshot) })
      return
    }
    views.create(buildViewInput(meta, snapshot))
  }

  return (
    <>
      {activeView ? (
        <span className="flex items-center gap-0.5">
          <HintTooltip asChild hint={t('contacts.views.edit')}>
            <PillButton
              variant="ghost"
              size="xs"
              className="w-8 px-0"
              aria-label={t('contacts.views.edit')}
              onClick={() => setDialog('edit')}
            >
              <PencilSimpleIcon className="size-3.5" />
            </PillButton>
          </HintTooltip>
          <HintTooltip asChild hint={t('contacts.views.delete')}>
            <PillButton
              variant="ghostDanger"
              size="xs"
              aria-label={t('contacts.views.delete')}
              onClick={() => setDialog('delete')}
            >
              <TrashIcon className="size-3.5" />
            </PillButton>
          </HintTooltip>
        </span>
      ) : (
        <PillButton
          variant="ghost"
          size="sm"
          className="gap-1.5 rounded-md text-primary-deep dark:text-primary"
          disabled={views.isPending}
          onClick={() => setDialog('create')}
        >
          <BookmarkIcon className="size-4" />
          {t('contacts.views.save')}
        </PillButton>
      )}

      <SaveViewDialog
        open={dialog === 'create' || dialog === 'edit'}
        onOpenChange={(open) => setDialog(open ? dialog : null)}
        title={t(dialog === 'edit' ? 'contacts.views.editTitle' : 'contacts.views.saveTitle')}
        initial={{
          name: dialog === 'edit' ? (activeView?.name ?? '') : '',
          description: dialog === 'edit' ? (activeView?.description ?? '') : '',
        }}
        onSubmit={submit}
      />

      <DeleteViewDialog
        open={dialog === 'delete'}
        onOpenChange={(open) => setDialog(open ? 'delete' : null)}
        name={activeView?.name ?? ''}
        onConfirm={() => {
          if (activeView) views.remove(activeView.id)
        }}
      />
    </>
  )
}
