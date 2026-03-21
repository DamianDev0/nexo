import { useState, useCallback } from 'react'
import { type SortConfig } from '../types'

export function useTableSort() {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  const handleSort = useCallback((key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' }
        }
        return null
      }
      return { key, direction: 'asc' }
    })
  }, [])

  const getSortDirection = useCallback(
    (key: string) => {
      if (sortConfig?.key === key) {
        return sortConfig.direction
      }
      return null
    },
    [sortConfig],
  )

  return {
    sortConfig,
    handleSort,
    getSortDirection,
  }
}
