'use client'

import { useCallback } from 'react'

import { useCallStore } from './call.store'

export function usePhoneDock() {
  const hidden = useCallStore((state) => state.hidden)

  const show = useCallback(() => {
    useCallStore.getState().setHidden(false)
    useCallStore.getState().setOpen(true)
  }, [])

  const hide = useCallback(() => {
    useCallStore.getState().setHidden(true)
  }, [])

  return { hidden, show, hide }
}
