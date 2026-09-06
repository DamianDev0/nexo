'use client'

import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CopyIcon,
  LockIcon,
  PencilSimpleIcon,
  PushPinIcon,
  ShareNetworkIcon,
  StarIcon,
  TrashIcon,
} from '@/shared/ui/icons'

import { VIEW_LIST_PREFIX } from '../config/view-list.constants'
import { isViewOwner } from '../lib/view-snapshot'
import { useContactViewsAdmin } from '../query/useContactViewsAdmin'

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

export function useViewTabMenu(
  views: ReadonlyArray<ContactView>,
  viewerId?: string | null,
): ViewMenuController {
  const { t } = useTranslation()
  const admin = useContactViewsAdmin()
  const [target, setTarget] = useState<ViewMenuTarget | null>(null)
  const [openMode, setOpenMode] = useState<ViewMenuMode | null>(null)

  const openDialog = useCallback((mode: ViewMenuMode, view: ContactView) => {
    setTarget({ mode, view })
    setOpenMode(mode)
  }, [])

  const close = useCallback(() => setOpenMode(null), [])

  const { update, duplicate } = admin
  const itemMenu = useCallback(
    (item: SmartListItem): ReadonlyArray<SmartListMenuAction> => {
      if (!item.id.startsWith(VIEW_LIST_PREFIX)) return []
      const view = views.find((entry) => entry.id === item.id.slice(VIEW_LIST_PREFIX.length))
      if (!view) return []
      const toggle = (data: {
        isFavorite?: boolean
        isDefault?: boolean
        visibility?: 'private' | 'shared'
      }) => update({ id: view.id, data })
      const duplicateAction: SmartListMenuAction = {
        key: 'duplicate',
        label: t('contacts.views.duplicate'),
        icon: CopyIcon,
        onSelect: () => duplicate(view.id),
      }
      if (!isViewOwner(view, viewerId)) return [duplicateAction]
      return [
        {
          key: 'favorite',
          label: t(view.isFavorite ? 'contacts.views.unfavorite' : 'contacts.views.favorite'),
          icon: StarIcon,
          onSelect: () => toggle({ isFavorite: !view.isFavorite }),
        },
        {
          key: 'default',
          label: t(view.isDefault ? 'contacts.views.unsetDefault' : 'contacts.views.setDefault'),
          icon: PushPinIcon,
          onSelect: () => toggle({ isDefault: !view.isDefault }),
        },
        {
          key: 'visibility',
          label: t(
            view.visibility === 'shared' ? 'contacts.views.makePrivate' : 'contacts.views.share',
          ),
          icon: view.visibility === 'shared' ? LockIcon : ShareNetworkIcon,
          onSelect: () =>
            toggle({ visibility: view.visibility === 'shared' ? 'private' : 'shared' }),
        },
        duplicateAction,
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
    [views, viewerId, t, update, duplicate, openDialog],
  )

  return { target, openMode, close, itemMenu, menuLabel: t('contacts.views.menu') }
}
