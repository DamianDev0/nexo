'use client'

import { useCallback, useState } from 'react'

import { useArchiveRecord } from '../query/useArchiveRecord'

import type { RecordBase } from '@/entities/object-descriptor'

export function useArchiveRecordDialog<TRecord extends RecordBase>(onArchived?: () => void) {
  const [target, setTarget] = useState<TRecord | null>(null)
  const { archive, isPending } = useArchiveRecord(onArchived)

  const close = useCallback(() => setTarget(null), [])

  const confirm = useCallback(() => {
    if (target) archive(target)
    setTarget(null)
  }, [archive, target])

  return {
    target,
    isPending,
    ask: useCallback((record: TRecord) => setTarget(record), []),
    close,
    confirm,
  }
}

export type ArchiveRecordDialogState<TRecord extends RecordBase = RecordBase> = ReturnType<
  typeof useArchiveRecordDialog<TRecord>
>
