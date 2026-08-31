'use client'

import { useEffect, useRef } from 'react'

import { writeSkeletonHint } from '@/entities/contact'

import type { Table } from '@tanstack/react-table'

export function useSkeletonHintSync<T>(
  table: Table<T>,
  rowCount: number,
  enabled: boolean,
  refreshKey: string,
): void {
  const lastHintRef = useRef('')

  useEffect(() => {
    if (!enabled) return
    const headers = table.getHeaderGroups()[0]?.headers ?? []
    if (headers.length <= 1) return
    const hint = { widths: headers.map((header) => header.getSize()), rows: rowCount || 5 }
    const serialized = JSON.stringify(hint)
    if (serialized === lastHintRef.current) return
    lastHintRef.current = serialized
    writeSkeletonHint(hint)
  }, [enabled, table, rowCount, refreshKey])
}
