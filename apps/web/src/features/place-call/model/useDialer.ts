'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { DIALER_LIMITS, DIALER_TIMINGS } from '../config/dialer.config'

import { useCallStore } from './call.store'
import { createStubTelephony } from './telephony-adapter'
import { useCallClock } from './useCallClock'
import { useDialHotkeys } from './useDialHotkeys'

import type { TelephonyAdapter } from './types/call.types'

export function useDialer() {
  const store = useCallStore()
  const adapterRef = useRef<TelephonyAdapter | null>(null)
  const seconds = useCallClock(store.startedAt)
  const [keypadOpen, setKeypadOpen] = useState(false)
  const [dtmf, setDtmf] = useState('')

  const ensureAdapter = useCallback(() => {
    adapterRef.current ??= createStubTelephony(DIALER_TIMINGS.connectMs)
    return adapterRef.current
  }, [])

  const placeCall = useCallback(async () => {
    const { number, status, callConnecting, reset } = useCallStore.getState()
    if (number === '' || status !== 'idle') return
    setKeypadOpen(false)
    setDtmf('')
    callConnecting()
    try {
      await ensureAdapter().connect(number, {
        onConnected: () => useCallStore.getState().callConnected(),
        onDisconnected: () => useCallStore.getState().callEnded(),
      })
    } catch {
      reset()
    }
  }, [ensureAdapter])

  const callNumber = useCallback(
    async (raw: string) => {
      useCallStore.getState().dialNumber(raw)
      await placeCall()
    },
    [placeCall],
  )

  const hangUp = useCallback(async () => {
    await ensureAdapter().disconnect()
  }, [ensureAdapter])

  const toggleMute = useCallback(() => {
    const next = !useCallStore.getState().muted
    ensureAdapter().setMuted(next)
    useCallStore.getState().toggleMuted()
  }, [ensureAdapter])

  const toggleHold = useCallback(() => {
    const next = !useCallStore.getState().held
    ensureAdapter().setHeld(next)
    useCallStore.getState().toggleHeld()
  }, [ensureAdapter])

  const toggleKeypad = useCallback(() => setKeypadOpen((open) => !open), [])

  const sendDtmf = useCallback(
    (digit: string) => {
      ensureAdapter().sendDigit(digit)
      setDtmf((current) => (current + digit).slice(-DIALER_LIMITS.dtmfMax))
    },
    [ensureAdapter],
  )

  useDialHotkeys({ enabled: store.open && store.status === 'idle', onDial: placeCall })

  useEffect(() => {
    return () => {
      void adapterRef.current?.disconnect()
    }
  }, [])

  return {
    open: store.open,
    status: store.status,
    number: store.number,
    muted: store.muted,
    held: store.held,
    history: store.history,
    seconds,
    keypadOpen,
    dtmf,
    setOpen: store.setOpen,
    appendDigit: store.appendDigit,
    deleteDigit: store.deleteDigit,
    placeCall,
    callNumber,
    hangUp,
    toggleMute,
    toggleHold,
    toggleKeypad,
    sendDtmf,
  }
}
