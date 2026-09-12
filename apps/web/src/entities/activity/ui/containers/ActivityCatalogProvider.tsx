'use client'

import { ActivityCatalogContext } from '../../model/activity-catalog-context'
import { useActivityTypes } from '../../query/useActivityTypes'

import type { ReactNode } from 'react'

export function ActivityCatalogProvider({ children }: Readonly<{ children: ReactNode }>) {
  const types = useActivityTypes()

  return <ActivityCatalogContext.Provider value={types}>{children}</ActivityCatalogContext.Provider>
}
