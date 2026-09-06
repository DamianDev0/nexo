import { ROUTES } from '@/shared/config/routes'
import { CloudArrowUpIcon, StackIcon } from '@/shared/ui/icons'

import type { ActionMenuItem } from '@/shared/ui/molecules/action-menu'
import type { TFunction } from 'i18next'

export function buildToolbarMenu(t: TFunction): ActionMenuItem[] {
  return [
    {
      id: 'import',
      label: t('contacts.import.cta'),
      icon: <CloudArrowUpIcon />,
      href: ROUTES.app.contacts.import,
    },
    {
      id: 'bulk-actions',
      label: t('bulkActions.title'),
      icon: <StackIcon />,
      href: ROUTES.app.bulkActions,
    },
  ]
}
