'use client'

import { useCallback } from 'react'

import { useReassignTaxonomy } from '../query/useTaxonomyUsage'

import type { TaxonomyReassignKind } from '@repo/shared-types'

interface UseReassignFlowArgs {
  readonly kind: TaxonomyReassignKind
  readonly fromKey: string | null
  readonly onReassigned: () => void
}

export function useReassignFlow({ kind, fromKey, onReassigned }: UseReassignFlowArgs) {
  const reassign = useReassignTaxonomy()
  const { mutate } = reassign

  const confirm = useCallback(
    (toKey: string) => {
      if (!fromKey) return
      mutate({ kind, fromKey, toKey }, { onSuccess: onReassigned })
    },
    [fromKey, kind, mutate, onReassigned],
  )

  return { confirm, isPending: reassign.isPending }
}
