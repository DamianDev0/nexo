'use client'

import { useCallback, useState } from 'react'

import type { BulkDialogContext } from './types/bulk-actions.types'
import type { BulkActionId } from '../config/bulk-action-registry.constants'

type DialogState = {
  readonly kind: BulkActionId
  readonly context: BulkDialogContext
}

export function useBulkDialog() {
  const [state, setState] = useState<DialogState | null>(null)

  const open = useCallback(
    (kind: BulkActionId, context: BulkDialogContext = {}) => setState({ kind, context }),
    [],
  )
  const close = useCallback(() => setState(null), [])

  return { kind: state?.kind ?? null, context: state?.context ?? {}, open, close }
}

export type BulkDialog = ReturnType<typeof useBulkDialog>
