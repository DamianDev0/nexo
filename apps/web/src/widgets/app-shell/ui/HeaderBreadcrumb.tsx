'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { useModuleLabels } from '@/entities/nomenclature'
import { BreadcrumbIcon } from '@/shared/ui/ruixen/breadcrumb-icon'

import { buildBreadcrumbTrail } from '../lib/breadcrumb-trail'

export function HeaderBreadcrumb() {
  const { t } = useTranslation()
  const moduleLabel = useModuleLabels()
  const pathname = usePathname()

  const items = buildBreadcrumbTrail(pathname, t, moduleLabel)
  if (items.length === 0) return null

  return <BreadcrumbIcon items={items} linkComponent={Link} showHomeIcon={false} />
}
