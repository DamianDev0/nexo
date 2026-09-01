'use client'

import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PencilSimpleIcon, TrashIcon } from '@/shared/ui/icons'

import { VIEW_LIST_PREFIX } from '../../config/view-list.constants'
import { useContactViewsAdmin } from '../../query/useContactViewsAdmin'
import { DeleteViewDialog } from '../DeleteViewDialog'
import { SaveViewDialog } from '../SaveViewDialog'

import type { SmartListItem, SmartListMenuAction } from '@/shared/ui/organisms/data-table'
import type { ContactView } from '@repo/shared-types'
import type { ReactNode } from 'react'

type ViewMenuMode = 'edit' | 'delete'

type ViewMenuTarget = {
  readonly mode: ViewMenuMode
  readonly view: ContactView
}

export function useViewTabMenu(views: ReadonlyArray<ContactView>): {
  itemMenu: (item: SmartListItem) => ReadonlyArray<SmartListMenuAction>
  menuLabel: string
  dialogs: ReactNode
} {
  const { t } = useTranslation()
  const admin = useContactViewsAdmin()
  const [target, setTarget] = useState<ViewMenuTarget | null>(null)
  const [openMode, setOpenMode] = useState<ViewMenuMode | null>(null)

  const openDialog = (mode: ViewMenuMode, view: ContactView) => {
    setTarget({ mode, view })
    setOpenMode(mode)
  }

  const itemMenu = useCallback(
    (item: SmartListItem): ReadonlyArray<SmartListMenuAction> => {
      if (!item.id.startsWith(VIEW_LIST_PREFIX)) return []
      const view = views.find((entry) => entry.id === item.id.slice(VIEW_LIST_PREFIX.length))
      if (!view) return []
      return [
        {
          key: 'edit',
          label: t('contacts.views.edit'),
          icon: PencilSimpleIcon,
          onSelect: () => openDialog('edit', view),
        },
        {
          key: 'delete',
          label: t('contacts.views.delete'),
          icon: TrashIcon,
          tone: 'danger',
          onSelect: () => openDialog('delete', view),
        },
      ]
    },
    [views, t],
  )

  const dialogs = (
    <>
      <SaveViewDialog
        open={openMode === 'edit'}
        onOpenChange={(open) => {
          if (!open) setOpenMode(null)
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
          if (!open) setOpenMode(null)
        }}
        name={target?.view.name ?? ''}
        onConfirm={() => {
          if (target) admin.remove(target.view.id)
        }}
      />
    </>
  )

  return { itemMenu, menuLabel: t('contacts.views.menu'), dialogs }
}
