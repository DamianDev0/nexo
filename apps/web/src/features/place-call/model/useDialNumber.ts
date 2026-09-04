'use client'

import { useCallback } from 'react'

import { useCallStore } from './call.store'

export function useDialNumber(): (raw: string) => void {
  return useCallback((raw) => useCallStore.getState().dialNumber(raw), [])
}
