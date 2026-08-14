import { ROUTES } from '@/shared/config/routes'
import { HouseIcon } from '@/shared/ui/icons'

import { SETTINGS_SECTION_ROUTE } from '../config/breadcrumb.constants'

import { navItemForPath } from './nav-items'

import type { BreadcrumbCrumb, ModuleLabelFn, TranslateFn } from '../model/types'

export function buildBreadcrumbTrail(
  pathname: string,
  t: TranslateFn,
  entryLabel: ModuleLabelFn,
): BreadcrumbCrumb[] {
  const entry = navItemForPath(pathname)
  if (!entry) return []

  const isDashboard = entry.key === 'dashboard'
  const home: BreadcrumbCrumb = {
    label: t('nav.dashboard'),
    href: isDashboard ? undefined : ROUTES.app.dashboard,
    icon: HouseIcon,
  }
  if (isDashboard) return [home]

  const segments = pathname.split('/').filter(Boolean)
  const section = entry.key === 'settings' ? segments[1] : undefined
  const child = section ? segments[2] : undefined

  const crumbs: BreadcrumbCrumb[] = [
    home,
    {
      label: entryLabel(entry.key, entry.titleKey),
      href: section ? entry.url : undefined,
      icon: entry.icon,
    },
  ]
  if (!section) return crumbs

  crumbs.push({
    label: t(`settings.sections.${section}`),
    href: child ? SETTINGS_SECTION_ROUTE[section] : undefined,
  })
  if (child) crumbs.push({ label: t(`settings.children.${section}.${child}`) })

  return crumbs
}
