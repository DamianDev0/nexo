'use client'

import { useCallback, useEffect, useState } from 'react'

import { useDraggable } from '@/shared/lib/hooks/useDraggable'

import { useCallStore } from './call.store'
import { useDialer } from './useDialer'
import { useMicGatedDial } from './useMicGatedDial'
import { usePhoneDock } from './usePhoneDock'

import type { DockScreen, PhoneTab } from './types/call.types'

export function useCallDock() {
  const dialer = useDialer()
  const phoneDock = usePhoneDock()
  const presence = useCallStore((state) => state.presence)
  const drag = useDraggable()
  const micGate = useMicGatedDial()
  const [screen, setScreen] = useState<DockScreen>('phone')
  const [phoneTab, setPhoneTab] = useState<PhoneTab>('dialpad')

  const inCall = dialer.status !== 'idle'
  const expanded = dialer.open || inCall

  const { ensureInViewport } = drag
  useEffect(() => {
    if (expanded) ensureInViewport()
  }, [expanded, ensureInViewport])

  useEffect(() => {
    void useCallStore.persist.rehydrate()
  }, [])

  const { requestDial } = micGate
  const { callNumber, placeCall } = dialer

  const callAndSwitch = useCallback(
    (number: string, name?: string) => {
      setScreen('phone')
      setPhoneTab('dialpad')
      requestDial(() => void callNumber(number, name))
    },
    [requestDial, callNumber],
  )

  const dialFromPad = useCallback(() => {
    requestDial(() => void placeCall())
  }, [requestDial, placeCall])

  return {
    dialer,
    drag,
    micGate,
    presence,
    inCall,
    expanded,
    hidden: phoneDock.hidden,
    hide: phoneDock.hide,
    screen,
    setScreen,
    phoneTab,
    setPhoneTab,
    callAndSwitch,
    dialFromPad,
  }
}

export type DockController = ReturnType<typeof useCallDock>
