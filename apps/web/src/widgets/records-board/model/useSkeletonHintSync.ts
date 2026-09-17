'use client'

import { useEffect, useRef } from 'react'

import { useObjectDescriptor, writeSkeletonHint } from '@/entities/object-descriptor'

import type { Table } from '@tanstack/react-table'

const DEFAULT_SKELETON_ROWS = 5

export function useSkeletonHintSync<T>(
  table: Table<T>,
  rowCount: number,
  enabled: boolean,
  refreshKey: string,
): void {
  const { queryRoot } = useObjectDescriptor()
  const lastHintRef = useRef('')

  useEffect(() => {
    if (!enabled) return
    const headers = table.getHeaderGroups()[0]?.headers ?? []
    if (headers.length <= 1) return
    const rows = rowCount > 0 ? rowCount : DEFAULT_SKELETON_ROWS
    const hint = { widths: headers.map((header) => header.getSize()), rows }
    const serialized = JSON.stringify(hint)
    if (serialized === lastHintRef.current) return
    lastHintRef.current = serialized
    writeSkeletonHint(queryRoot, hint)
  }, [enabled, table, rowCount, refreshKey, queryRoot])
}
