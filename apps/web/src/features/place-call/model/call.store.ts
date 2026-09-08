import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { DIALER_LIMITS, DIALER_TIMINGS } from '../config/dialer.config'
import { callLogEntry, tenantScopedStorage } from '../lib/call-history-storage'
import { isDialChar, toDialString } from '../lib/format-dial-number'

import type {
  AudioDeviceKind,
  AudioPrefs,
  CallLogEntry,
  CallStatus,
  PresenceKey,
  TelephonyError,
} from './types/call.types'

type CallState = {
  open: boolean
  hidden: boolean
  status: CallStatus
  error: TelephonyError | null
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
  callRinging: () => void
  callConnected: () => void
  callEnded: () => void
  callFailed: (error: TelephonyError) => void
  toggleMuted: () => void
  toggleHeld: () => void
  toggleRecording: () => void
  reset: () => void
}

let resetTimer: ReturnType<typeof setTimeout> | null = null

export const useCallStore = create<CallState>()(
  persist(
    (set, get) => ({
      open: false,
      hidden: false,
      status: 'idle',
      error: null,
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
      callConnecting: () => set({ status: 'connecting', error: null }),
      callRinging: () =>
        set((state) => (state.status === 'connecting' ? { status: 'ringing' } : state)),
      callConnected: () => set({ status: 'active', startedAt: Date.now() }),
      callEnded: () => {
        set((state) => ({
          status: 'ended',
          startedAt: null,
          held: false,
          recording: false,
          history: [
            callLogEntry(state.number, state.callerName, state.startedAt),
            ...state.history,
          ].slice(0, DIALER_LIMITS.historyMax),
        }))
        resetTimer = setTimeout(() => get().reset(), DIALER_TIMINGS.resetMs)
      },
      callFailed: (error) => {
        set((state) =>
          state.status === 'idle' || state.status === 'ended' || state.status === 'failed'
            ? state
            : {
                status: 'failed',
                error,
                startedAt: null,
                held: false,
                recording: false,
                history: [
                  callLogEntry(state.number, state.callerName, null),
                  ...state.history,
                ].slice(0, DIALER_LIMITS.historyMax),
              },
        )
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
          error: null,
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
      storage: createJSONStorage(tenantScopedStorage),
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
