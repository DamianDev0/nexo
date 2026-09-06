import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { tenantRef } from '@/shared/api/tenant-ref'

import { DIALER_LIMITS, DIALER_TIMINGS } from '../config/dialer.config'
import { isDialChar, toDialString } from '../lib/format-dial-number'

import type {
  AudioDeviceKind,
  AudioPrefs,
  CallLogEntry,
  CallStatus,
  PresenceKey,
} from './types/call.types'

type CallState = {
  open: boolean
  hidden: boolean
  status: CallStatus
  number: string
  callerName: string | null
  muted: boolean
  held: boolean
  recording: boolean
  startedAt: number | null
  history: CallLogEntry[]
  presence: PresenceKey
  audio: AudioPrefs
  receiveHere: boolean
  setOpen: (open: boolean) => void
  setHidden: (hidden: boolean) => void
  setPresence: (presence: PresenceKey) => void
  setAudioDevice: (kind: AudioDeviceKind, id: string | null) => void
  toggleReceiveHere: () => void
  signOut: () => void
  setNumber: (raw: string) => void
  dialNumber: (raw: string, name?: string) => void
  appendDigit: (digit: string) => void
  deleteDigit: () => void
  callConnecting: () => void
  callConnected: () => void
  callEnded: () => void
  toggleMuted: () => void
  toggleHeld: () => void
  toggleRecording: () => void
  reset: () => void
}

let resetTimer: ReturnType<typeof setTimeout> | null = null

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

function historyStorage() {
  try {
    const storage = typeof window === 'undefined' ? null : window.localStorage
    if (typeof storage?.setItem !== 'function') return noopStorage
    storage.removeItem('nexo-call-log')
    const scopedKey = (name: string) => {
      const slug = tenantRef.get()
      return slug === null ? null : `${name}:${slug}`
    }
    return {
      getItem: (name: string) => {
        const key = scopedKey(name)
        return key === null ? null : storage.getItem(key)
      },
      setItem: (name: string, value: string) => {
        const key = scopedKey(name)
        if (key !== null) storage.setItem(key, value)
      },
      removeItem: (name: string) => {
        const key = scopedKey(name)
        if (key !== null) storage.removeItem(key)
      },
    }
  } catch {
    return noopStorage
  }
}

function logEntry(number: string, name: string | null, startedAt: number | null): CallLogEntry {
  return {
    id: crypto.randomUUID(),
    number,
    name,
    at: Date.now(),
    durationSec: startedAt === null ? 0 : Math.round((Date.now() - startedAt) / 1000),
    outcome: startedAt === null ? 'canceled' : 'completed',
  }
}

export const useCallStore = create<CallState>()(
  persist(
    (set, get) => ({
      open: false,
      hidden: false,
      status: 'idle',
      number: '',
      callerName: null,
      muted: false,
      held: false,
      recording: false,
      startedAt: null,
      presence: 'available',
      audio: { mic: null, speaker: null, ringer: null },
      receiveHere: true,
      history: [],
      setOpen: (open) => set({ open }),
      setHidden: (hidden) => set(hidden ? { hidden, open: false } : { hidden }),
      dialNumber: (raw, name) =>
        set((state) => {
          if (state.status !== 'idle') return { open: true }
          const number = toDialString(raw).slice(0, DIALER_LIMITS.maxDigits)
          return { open: true, number, callerName: name ?? null }
        }),
      setNumber: (raw) =>
        set((state) =>
          state.status === 'idle'
            ? { number: toDialString(raw).slice(0, DIALER_LIMITS.maxDigits), callerName: null }
            : state,
        ),
      appendDigit: (digit) =>
        set((state) => {
          const accepts =
            state.status === 'idle' &&
            isDialChar(digit) &&
            state.number.length < DIALER_LIMITS.maxDigits
          return accepts ? { number: state.number + digit, callerName: null } : state
        }),
      deleteDigit: () =>
        set((state) => (state.status === 'idle' ? { number: state.number.slice(0, -1) } : state)),
      callConnecting: () => set({ status: 'connecting' }),
      callConnected: () => set({ status: 'active', startedAt: Date.now() }),
      callEnded: () => {
        set((state) => ({
          status: 'ended',
          startedAt: null,
          held: false,
          recording: false,
          history: [
            logEntry(state.number, state.callerName, state.startedAt),
            ...state.history,
          ].slice(0, DIALER_LIMITS.historyMax),
        }))
        resetTimer = setTimeout(() => get().reset(), DIALER_TIMINGS.resetMs)
      },
      toggleMuted: () => set((state) => ({ muted: !state.muted })),
      toggleHeld: () => set((state) => ({ held: !state.held })),
      toggleRecording: () => set((state) => ({ recording: !state.recording })),
      setPresence: (presence) => set({ presence }),
      setAudioDevice: (kind, id) => set((state) => ({ audio: { ...state.audio, [kind]: id } })),
      toggleReceiveHere: () => set((state) => ({ receiveHere: !state.receiveHere })),
      signOut: () => {
        get().reset()
        set({
          open: false,
          history: [],
          presence: 'available',
          audio: { mic: null, speaker: null, ringer: null },
          receiveHere: true,
        })
      },
      reset: () => {
        if (resetTimer !== null) clearTimeout(resetTimer)
        resetTimer = null
        set({
          status: 'idle',
          number: '',
          callerName: null,
          muted: false,
          held: false,
          recording: false,
          startedAt: null,
        })
      },
    }),
    {
      name: 'nexo-call-log',
      storage: createJSONStorage(historyStorage),
      partialize: (state) => ({
        history: state.history,
        hidden: state.hidden,
        presence: state.presence,
        audio: state.audio,
        receiveHere: state.receiveHere,
      }),
    },
  ),
)
