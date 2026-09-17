import { ROUTES } from '@/shared/config/routes'
import { CloudArrowUpIcon, StackIcon } from '@/shared/ui/icons'

import type { ObjectDescriptor } from '@/entities/object-descriptor'
import type { ActionMenuItem } from '@/shared/ui/molecules/action-menu'
import type { TFunction } from 'i18next'

export function buildToolbarMenu(
  t: TFunction,
  routes: ObjectDescriptor['routes'],
): ActionMenuItem[] {
  const importItem: ActionMenuItem[] = routes.import
    ? [{ id: 'import', label: t('imports.cta'), icon: <CloudArrowUpIcon />, href: routes.import }]
    : []
  return [
    ...importItem,
    {
      id: 'bulk-actions',
      label: t('bulkActions.title'),
      icon: <StackIcon />,
      href: ROUTES.app.bulkActions,
    },
  ]
}
