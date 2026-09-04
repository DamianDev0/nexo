'use client'

import { useTranslation } from 'react-i18next'

import { useContactViewsAdmin } from '../../query/useContactViewsAdmin'
import { DeleteViewDialog } from '../DeleteViewDialog'
import { SaveViewDialog } from '../SaveViewDialog'

import type { ViewMenuController } from '../../model/useViewTabMenu'

type ViewTabDialogsProps = {
  readonly menu: ViewMenuController
}

export function ViewTabDialogs({ menu }: Readonly<ViewTabDialogsProps>) {
  const { t } = useTranslation()
  const admin = useContactViewsAdmin()
  const { target, openMode, close } = menu

  return (
    <>
      <SaveViewDialog
        open={openMode === 'edit'}
        onOpenChange={(open) => {
          if (!open) close()
        }}
        title={t('contacts.views.editTitle')}
        initial={{
          name: target?.view.name ?? '',
          description: target?.view.description ?? '',
        }}
        onSubmit={(meta) => {
          if (!target) return
          admin.update({
            id: target.view.id,
            data: { name: meta.name.trim(), description: meta.description.trim() || null },
          })
        }}
      />
      <DeleteViewDialog
        open={openMode === 'delete'}
        onOpenChange={(open) => {
          if (!open) close()
        }}
        name={target?.view.name ?? ''}
        onConfirm={() => {
          if (target) admin.remove(target.view.id)
        }}
      />
    </>
  )
}
