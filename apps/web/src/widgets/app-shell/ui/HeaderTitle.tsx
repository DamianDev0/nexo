'use client'

import { usePathname } from 'next/navigation'

import { useModuleLabels } from '@/entities/nomenclature'

import { navItemForPath } from '../lib/nav-items'

export function HeaderTitle() {
  const moduleLabel = useModuleLabels()
  const pathname = usePathname()
  const item = navItemForPath(pathname)

  if (!item) return null

  return (
    <h1 className="text-lg font-bold tracking-tight text-foreground">
      {moduleLabel(item.key, item.titleKey)}
    </h1>
  )
}
