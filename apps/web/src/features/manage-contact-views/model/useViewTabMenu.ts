'use client'

import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PencilSimpleIcon, TrashIcon } from '@/shared/ui/icons'

import { VIEW_LIST_PREFIX } from '../config/view-list.constants'

import type { SmartListItem, SmartListMenuAction } from '@/shared/ui/organisms/data-table'
import type { ContactView } from '@repo/shared-types'

export type ViewMenuMode = 'edit' | 'delete'

type ViewMenuTarget = {
  readonly mode: ViewMenuMode
  readonly view: ContactView
}

export type ViewMenuController = {
  readonly target: ViewMenuTarget | null
  readonly openMode: ViewMenuMode | null
  readonly close: () => void
  readonly itemMenu: (item: SmartListItem) => ReadonlyArray<SmartListMenuAction>
  readonly menuLabel: string
}

export function useViewTabMenu(views: ReadonlyArray<ContactView>): ViewMenuController {
  const { t } = useTranslation()
  const [target, setTarget] = useState<ViewMenuTarget | null>(null)
  const [openMode, setOpenMode] = useState<ViewMenuMode | null>(null)

  const openDialog = useCallback((mode: ViewMenuMode, view: ContactView) => {
    setTarget({ mode, view })
    setOpenMode(mode)
  }, [])

  const close = useCallback(() => setOpenMode(null), [])

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
    [views, t, openDialog],
  )

  return { target, openMode, close, itemMenu, menuLabel: t('contacts.views.menu') }
}
