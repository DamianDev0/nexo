'use client'

import { useCallback, useState } from 'react'

import {
  isBulkActionActive,
  useBulkActionStatus,
  useCreateBulkAction,
} from '@/entities/bulk-action'

import type { BulkAction, CreateBulkActionInput } from '@repo/shared-types'

export function useBulkJob() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const create = useCreateBulkAction()
  const status = useBulkActionStatus(activeId)

  const start = useCallback(
    (request: CreateBulkActionInput, onQueued?: (created: BulkAction) => void) => {
      create.mutate(request, {
        onSuccess: (created) => {
          setActiveId(created.id)
          onQueued?.(created)
        },
      })
    },
    [create],
  )

  const track = useCallback((id: string) => setActiveId(id), [])
  const release = useCallback(() => setActiveId(null), [])

  const live = status.data ?? null
  const running = live && isBulkActionActive(live.status) ? live : null
  const finished = live && !isBulkActionActive(live.status) ? live : null

  return {
    start,
    track,
    release,
    running,
    finished,
    isBusy: create.isPending || activeId !== null,
  }
}

export type BulkJob = ReturnType<typeof useBulkJob>
