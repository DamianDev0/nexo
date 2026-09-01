'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useViewTabMenu } from '@/features/manage-contact-views'
import { ROUTES } from '@/shared/config/routes'
import { GearIcon } from '@/shared/ui/icons'

import type { SmartListItem, SmartListMenuAction } from '@/shared/ui/organisms/data-table'
import type { ContactView } from '@repo/shared-types'
import type { ReactNode } from 'react'

export type ListMenu = {
  readonly itemMenu: (item: SmartListItem) => ReadonlyArray<SmartListMenuAction>
  readonly menuLabel: string
  readonly dialogs: ReactNode
}

export function useListMenu(views: ReadonlyArray<ContactView>): ListMenu {
  const { t } = useTranslation()
  const router = useRouter()
  const viewMenu = useViewTabMenu(views)

  const itemMenu = useCallback(
    (item: SmartListItem): ReadonlyArray<SmartListMenuAction> => {
      const viewActions = viewMenu.itemMenu(item)
      if (viewActions.length > 0) return viewActions
      if (item.pinned) return []
      return [
        {
          key: 'manage',
          label: t('contacts.lists.manage'),
          icon: GearIcon,
          onSelect: () => router.push(ROUTES.app.settings.contacts.status),
        },
      ]
    },
    [viewMenu, t, router],
  )

  return { itemMenu, menuLabel: viewMenu.menuLabel, dialogs: viewMenu.dialogs }
}
