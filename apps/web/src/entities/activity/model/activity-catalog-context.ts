'use client'

import { createContext, useContext } from 'react'

import type { ActivityTypeDef } from '@repo/shared-types'

const EMPTY: ReadonlyArray<ActivityTypeDef> = []

export const ActivityCatalogContext = createContext<ReadonlyArray<ActivityTypeDef>>(EMPTY)

export function useActivityCatalog(): ReadonlyArray<ActivityTypeDef> {
  return useContext(ActivityCatalogContext)
}
