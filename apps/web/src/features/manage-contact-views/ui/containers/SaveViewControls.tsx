'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { BookmarkIcon } from '@/shared/ui/icons'

import { buildViewInput, isSnapshotDirty, type ViewSnapshot } from '../../lib/view-snapshot'
import { useContactViewsAdmin } from '../../query/useContactViewsAdmin'
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
  const [open, setOpen] = useState(false)

  if (activeView || !isSnapshotDirty(snapshot)) return null

  const submit = (meta: ViewFormValues) => {
    views.create(buildViewInput(meta, snapshot))
  }

  return (
    <>
      <PillButton
        variant="ghost"
        size="sm"
        className="gap-1.5 rounded-md text-primary-deep dark:text-primary"
        disabled={views.isPending}
        onClick={() => setOpen(true)}
      >
        <BookmarkIcon className="size-4" />
        {t('contacts.views.save')}
      </PillButton>

      <SaveViewDialog
        open={open}
        onOpenChange={setOpen}
        title={t('contacts.views.saveTitle')}
        initial={{ name: '', description: '' }}
        onSubmit={submit}
      />
    </>
  )
}
