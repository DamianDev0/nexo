'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { useModuleLabels } from '@/entities/nomenclature'
import { BreadcrumbIcon } from '@/shared/ui/ruixen/breadcrumb-icon'

import { buildBreadcrumbTrail } from '../lib/breadcrumb-trail'
import { navItemForPath } from '../lib/nav-items'
import { useBreadcrumbTailStore } from '../model/breadcrumb-tail.store'

export function HeaderBreadcrumb() {
  const { t } = useTranslation()
  const moduleLabel = useModuleLabels()
  const pathname = usePathname()

  const tail = useBreadcrumbTailStore((state) => state.label)

  const trail = buildBreadcrumbTrail(pathname, t, moduleLabel)
  if (trail.length === 0) return null

  const items =
    tail === null
      ? trail
      : [
          ...trail.slice(0, -1),
          { ...trail[trail.length - 1]!, href: navItemForPath(pathname)?.url },
          { label: tail },
        ]

  return <BreadcrumbIcon items={items} linkComponent={Link} showHomeIcon={false} />
}
