'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useObjectDescriptor } from '@/entities/object-descriptor'
import { useViewTabMenu } from '@/features/manage-views'
import { GearIcon } from '@/shared/ui/icons'

import type { ViewMenuController } from '@/features/manage-views'
import type { SmartListItem, SmartListMenuAction } from '@/shared/ui/organisms/data-table'
import type { ObjectView } from '@repo/shared-types'

export type ListMenu = {
  readonly itemMenu: (item: SmartListItem) => ReadonlyArray<SmartListMenuAction>
  readonly menuLabel: string
  readonly viewMenu: ViewMenuController
}

export function useListMenu(views: ReadonlyArray<ObjectView>, viewerId?: string | null): ListMenu {
  const { t } = useTranslation()
  const router = useRouter()
  const { routes } = useObjectDescriptor()
  const viewMenu = useViewTabMenu(views, viewerId)
  const settingsRoute = routes.listSettings

  const itemMenu = useCallback(
    (item: SmartListItem): ReadonlyArray<SmartListMenuAction> => {
      const viewActions = viewMenu.itemMenu(item)
      if (viewActions.length > 0) return viewActions
      if (item.pinned || !settingsRoute) return []
      return [
        {
          key: 'manage',
          label: t('records.lists.manage'),
          icon: GearIcon,
          onSelect: () => router.push(settingsRoute),
        },
      ]
    },
    [viewMenu, t, router, settingsRoute],
  )

  return { itemMenu, menuLabel: viewMenu.menuLabel, viewMenu }
}
