'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import telephonyService from '@/shared/api/services/telephony.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { DIALER_LIMITS } from '../config/dialer.config'

import { useCallStore } from './call.store'
import { createTwilioTelephony } from './twilio-telephony'
import { useCallClock } from './useCallClock'
import { useDialHotkeys } from './useDialHotkeys'

import type { TelephonyAdapter } from './types/call.types'

export function useDialer() {
  const store = useCallStore()
  const queryClient = useQueryClient()
  const adapterRef = useRef<TelephonyAdapter | null>(null)
  const seconds = useCallClock(store.startedAt)
  const [keypadOpen, setKeypadOpen] = useState(false)
  const [dtmf, setDtmf] = useState('')

  const ensureAdapter = useCallback(() => {
    adapterRef.current ??= createTwilioTelephony({
      fetchToken: () =>
        queryClient.fetchQuery({
          queryKey: QUERY_KEYS.telephony.voiceToken,
          queryFn: telephonyService.voiceToken,
          staleTime: 0,
        }),
    })
    return adapterRef.current
  }, [queryClient])

  const placeCall = useCallback(async () => {
    const { number, status, callConnecting } = useCallStore.getState()
    if (number === '' || status !== 'idle') return
    setKeypadOpen(false)
    setDtmf('')
    callConnecting()
    await ensureAdapter().connect(number, {
      onRinging: () => useCallStore.getState().callRinging(),
      onConnected: () => useCallStore.getState().callConnected(),
      onDisconnected: () => useCallStore.getState().callEnded(),
      onFailed: (error) => useCallStore.getState().callFailed(error),
    })
  }, [ensureAdapter])

  const callNumber = useCallback(
    async (raw: string, name?: string) => {
      useCallStore.getState().dialNumber(raw, name)
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

  const toggleRecord = useCallback(() => {
    const next = !useCallStore.getState().recording
    ensureAdapter().setRecording(next)
    useCallStore.getState().toggleRecording()
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
      const adapter = adapterRef.current
      adapterRef.current = null
      if (adapter === null) return
      void adapter.disconnect().finally(() => adapter.dispose())
    }
  }, [])

  return {
    open: store.open,
    status: store.status,
    error: store.error,
    number: store.number,
    callerName: store.callerName,
    muted: store.muted,
    held: store.held,
    recording: store.recording,
    history: store.history,
    seconds,
    keypadOpen,
    dtmf,
    setOpen: store.setOpen,
    setNumber: store.setNumber,
    appendDigit: store.appendDigit,
    deleteDigit: store.deleteDigit,
    placeCall,
    callNumber,
    hangUp,
    toggleMute,
    toggleHold,
    toggleRecord,
    toggleKeypad,
    sendDtmf,
  }
}
