'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { useCallback } from 'react'
import { sileo } from 'sileo'

import { QUERY_KEYS } from '@/shared/query/query-keys'

import { useObjectDescriptor } from '../model/object-descriptor-context'
import { usePendingRecordPatches } from '../model/record-pending.store'

import type { RecordBase } from '../model/types/object-descriptor'

type RecordPage<TRecord> = { readonly data: TRecord[] }

type Reversal<TRecord> = {
  readonly id: string
  readonly previous: TRecord
  readonly keys: ReadonlyArray<keyof TRecord & string>
}

type OptimisticRecordListPatchOptions<TRecord, TChange> = {
  mutationFn: (change: TChange) => Promise<unknown>
  patch: (record: TRecord, change: TChange) => TRecord
  match: (record: TRecord, change: TChange) => boolean
  successTitle: () => string
}

function changedKeys<TRecord extends RecordBase>(
  previous: TRecord,
  next: TRecord,
): ReadonlyArray<keyof TRecord & string> {
  return (Object.keys(next) as Array<keyof TRecord & string>).filter(
    (key) => next[key] !== previous[key],
  )
}

function revertOwnKeys<TRecord extends RecordBase>(
  record: TRecord,
  reversal: Reversal<TRecord>,
): TRecord {
  const restored = { ...record }
  for (const key of reversal.keys) restored[key] = reversal.previous[key]
  return restored
}

export function useOptimisticRecordListPatch<TRecord extends RecordBase, TChange>({
  mutationFn,
  patch,
  match,
  successTitle,
}: OptimisticRecordListPatchOptions<TRecord, TChange>) {
  const client = useQueryClient()
  const descriptor = useObjectDescriptor<TRecord>()
  const lists = QUERY_KEYS.objects.lists(descriptor.queryRoot)

  const { mutate } = useMutation({
    mutationFn,
    scope: { id: `${descriptor.queryRoot}-list-patch` },
    onMutate: async (change: TChange): Promise<{ reversals: Array<Reversal<TRecord>> }> => {
      await client.cancelQueries({ queryKey: lists })
      const reversals: Array<Reversal<TRecord>> = []
      client.setQueriesData<RecordPage<TRecord>>({ queryKey: lists }, (page) =>
        page
          ? {
              ...page,
              data: page.data.map((record) => {
                if (!match(record, change)) return record
                const next = patch(record, change)
                reversals.push({ id: record.id, previous: record, keys: changedKeys(record, next) })
                return next
              }),
            }
          : page,
      )
      usePendingRecordPatches
        .getState()
        .begin(reversals.map((reversal) => ({ id: reversal.id, keys: reversal.keys })))
      return { reversals }
    },
    onSuccess: () => sileo.success({ title: successTitle() }),
    onError: (_error, _change, context) => {
      const byId = new Map(context?.reversals.map((reversal) => [reversal.id, reversal]))
      client.setQueriesData<RecordPage<TRecord>>({ queryKey: lists }, (page) =>
        page
          ? {
              ...page,
              data: page.data.map((record) => {
                const reversal = byId.get(record.id)
                return reversal ? revertOwnKeys(record, reversal) : record
              }),
            }
          : page,
      )
      sileo.error({ title: t('common.saveFailed') })
    },
    onSettled: (_data, _error, _change, context) => {
      usePendingRecordPatches.getState().end(context?.reversals.map((r) => r.id) ?? [])
      void descriptor.invalidateRecords(client)
    },
  })

  return useCallback((change: TChange) => mutate(change), [mutate])
}
