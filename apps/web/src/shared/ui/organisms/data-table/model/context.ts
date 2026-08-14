'use client'

import { createContext, useContext } from 'react'

import type { DataTableInstance } from './use-data-table'

const DataTableContext = createContext<DataTableInstance<unknown> | null>(null)

export const DataTableProvider = DataTableContext.Provider

export function useDataTableContext(): DataTableInstance<unknown> {
  const ctx = useContext(DataTableContext)
  if (!ctx) throw new Error('DataTable subcomponents must be used within DataTable root')
  return ctx
}
