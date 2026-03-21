import { useState, useCallback } from 'react'
import { type ColumnFilter } from '../types'

export function useTableFilter() {
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([])

  const setFilter = useCallback((key: string, value: string) => {
    setColumnFilters((current) => {
      const existing = current.filter((f) => f.key !== key)
      if (value) {
        return [...existing, { key, value }]
      }
      return existing
    })
  }, [])

  const getFilterValue = useCallback(
    (key: string) => {
      return columnFilters.find((f) => f.key === key)?.value || ''
    },
    [columnFilters],
  )

  const clearFilter = useCallback((key: string) => {
    setColumnFilters((current) => current.filter((f) => f.key !== key))
  }, [])

  const clearAllFilters = useCallback(() => {
    setColumnFilters([])
  }, [])

  return {
    columnFilters,
    setFilter,
    getFilterValue,
    clearFilter,
    clearAllFilters,
  }
}
