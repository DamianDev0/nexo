'use client'

import { blankToUndefined } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'
import { useObjectDescriptor } from '@/entities/object-descriptor'

import { useViewsAdmin } from '../../query/useViewsAdmin'
import { DeleteViewDialog } from '../DeleteViewDialog'
import { SaveViewDialog } from '../SaveViewDialog'

import type { ViewMenuController } from '../../model/useViewTabMenu'

type ViewTabDialogsProps = {
  readonly menu: ViewMenuController
}

export function ViewTabDialogs({ menu }: Readonly<ViewTabDialogsProps>) {
  const { t } = useTranslation()
  const admin = useViewsAdmin()
  const terms = useEntityTerms(useObjectDescriptor().type)
  const { target, openMode, close } = menu

  return (
    <>
      <SaveViewDialog
        open={openMode === 'edit'}
        onOpenChange={(open) => {
          if (!open) close()
        }}
        title={t('views.editTitle')}
        initial={{
          name: target?.view.name ?? '',
          description: target?.view.description ?? '',
        }}
        onSubmit={(meta) => {
          if (!target) return
          admin.update({
            id: target.view.id,
            data: {
              name: meta.name.trim(),
              description: blankToUndefined(meta.description.trim()) ?? null,
            },
          })
        }}
      />
      <DeleteViewDialog
        open={openMode === 'delete'}
        onOpenChange={(open) => {
          if (!open) close()
        }}
        name={target?.view.name ?? ''}
        entities={terms.lowerPlural}
        onConfirm={() => {
          if (target) admin.remove(target.view.id)
        }}
      />
    </>
  )
}
