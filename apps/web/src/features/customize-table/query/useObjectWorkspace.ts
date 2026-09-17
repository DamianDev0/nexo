'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useObjectDescriptor } from '@/entities/object-descriptor'
import { objectViewsService } from '@/shared/api/services/object-views.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { TABLE_SAVED_HINT_MS, TABLE_SAVE_DELAY_MS } from '../config/table.constants'

import type { ObjectTableState, ObjectWorkspaceBase } from '@repo/shared-types'

export function useObjectWorkspace<TWorkspace extends ObjectWorkspaceBase>() {
  const { apiPath, queryRoot } = useObjectDescriptor()
  return useQuery({
    queryKey: QUERY_KEYS.objects.workspace(queryRoot),
    queryFn: () => objectViewsService(apiPath).workspace<TWorkspace>(),
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export type TableSaveStatus = 'idle' | 'loading' | 'success' | 'error'

function toSaveStatus(state: { isPending: boolean; isError: boolean; isSuccess: boolean }) {
  if (state.isPending) return 'loading'
  if (state.isError) return 'error'
  return state.isSuccess ? 'success' : 'idle'
}

export function useSaveTableState() {
  const { apiPath, queryRoot } = useObjectDescriptor()
  const client = useQueryClient()
  const service = useMemo(() => objectViewsService(apiPath), [apiPath])
  const mutation = useMutation({
    mutationFn: service.saveTableState,
    scope: { id: `${queryRoot}-table-state` },
  })
  const pending = useRef<ObjectTableState | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const { mutate, reset, isSuccess } = mutation

  const flush = useCallback(() => {
    clearTimeout(timer.current)
    const patch = pending.current
    pending.current = null
    if (patch) mutate(patch)
  }, [mutate])

  useEffect(() => flush, [flush])

  useEffect(() => {
    if (!isSuccess) return
    const settle = setTimeout(reset, TABLE_SAVED_HINT_MS)
    return () => clearTimeout(settle)
  }, [isSuccess, reset])

  const save = useCallback(
    (patch: ObjectTableState) => {
      client.setQueryData<ObjectWorkspaceBase>(
        QUERY_KEYS.objects.workspace(queryRoot),
        (previous) =>
          previous ? { ...previous, tableState: { ...previous.tableState, ...patch } } : previous,
      )
      pending.current = { ...pending.current, ...patch }
      clearTimeout(timer.current)
      timer.current = setTimeout(flush, TABLE_SAVE_DELAY_MS)
    },
    [client, flush, queryRoot],
  )

  return { save, status: toSaveStatus(mutation) as TableSaveStatus }
}
