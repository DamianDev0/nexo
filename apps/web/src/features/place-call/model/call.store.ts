import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { tenantRef } from '@/shared/api/tenant-ref'

import { DIALER_LIMITS, DIALER_TIMINGS } from '../config/dialer.config'
import { isDialChar, toDialString } from '../lib/format-dial-number'

import type { CallLogEntry, CallStatus } from './types/call.types'

type CallState = {
  open: boolean
  status: CallStatus
  number: string
  muted: boolean
  held: boolean
  startedAt: number | null
  history: CallLogEntry[]
  setOpen: (open: boolean) => void
  dialNumber: (raw: string) => void
  appendDigit: (digit: string) => void
  deleteDigit: () => void
  callConnecting: () => void
  callConnected: () => void
  callEnded: () => void
  toggleMuted: () => void
  toggleHeld: () => void
  reset: () => void
}

let resetTimer: ReturnType<typeof setTimeout> | null = null

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

function scopedKey(name: string): string {
  return `${name}:${tenantRef.get() ?? 'anon'}`
}

function historyStorage() {
  try {
    const storage = typeof window === 'undefined' ? null : window.localStorage
    if (typeof storage?.setItem !== 'function') return noopStorage
    storage.removeItem('nexo-call-log')
    return {
      getItem: (name: string) => storage.getItem(scopedKey(name)),
      setItem: (name: string, value: string) => storage.setItem(scopedKey(name), value),
      removeItem: (name: string) => storage.removeItem(scopedKey(name)),
    }
  } catch {
    return noopStorage
  }
}

function logEntry(number: string, startedAt: number | null): CallLogEntry {
  return {
    id: crypto.randomUUID(),
    number,
    at: Date.now(),
    durationSec: startedAt === null ? 0 : Math.round((Date.now() - startedAt) / 1000),
    outcome: startedAt === null ? 'canceled' : 'completed',
  }
}

export const useCallStore = create<CallState>()(
  persist(
    (set, get) => ({
      open: false,
      status: 'idle',
      number: '',
      muted: false,
      held: false,
      startedAt: null,
      history: [],
      setOpen: (open) => set({ open }),
      dialNumber: (raw) =>
        set((state) => {
          if (state.status !== 'idle') return { open: true }
          const number = toDialString(raw).slice(0, DIALER_LIMITS.maxDigits)
          return { open: true, number }
        }),
      appendDigit: (digit) =>
        set((state) => {
          const accepts =
            state.status === 'idle' &&
            isDialChar(digit) &&
            state.number.length < DIALER_LIMITS.maxDigits
          return accepts ? { number: state.number + digit } : state
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
          history: [logEntry(state.number, state.startedAt), ...state.history].slice(
            0,
            DIALER_LIMITS.historyMax,
          ),
        }))
        resetTimer = setTimeout(() => get().reset(), DIALER_TIMINGS.resetMs)
      },
      toggleMuted: () => set((state) => ({ muted: !state.muted })),
      toggleHeld: () => set((state) => ({ held: !state.held })),
      reset: () => {
        if (resetTimer !== null) clearTimeout(resetTimer)
        resetTimer = null
        set({ status: 'idle', number: '', muted: false, held: false, startedAt: null })
      },
    }),
    {
      name: 'nexo-call-log',
      storage: createJSONStorage(historyStorage),
      partialize: (state) => ({ history: state.history }),
    },
  ),
)
