'use client'

import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { navItemForPath } from '../model/nav-items'

export function HeaderTitle() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const item = navItemForPath(pathname)

  if (!item) return null

  return <h1 className="text-lg font-bold tracking-tight text-foreground">{t(item.titleKey)}</h1>
}
