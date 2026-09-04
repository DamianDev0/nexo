'use client'

import { useEffect } from 'react'

import { isEditableTarget } from '@/shared/lib/keyboard'

import { isDialChar } from '../lib/format-dial-number'

import { useCallStore } from './call.store'

type DialHotkeysOptions = {
  readonly enabled: boolean
  readonly onDial: () => unknown
}

export function useDialHotkeys({ enabled, onDial }: Readonly<DialHotkeysOptions>): void {
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return
      if (isDialChar(event.key)) useCallStore.getState().appendDigit(event.key)
      if (event.key === 'Backspace') useCallStore.getState().deleteDigit()
      if (event.key === 'Enter') void onDial()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, onDial])
}
