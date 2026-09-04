'use client'

import { createContext, useContext } from 'react'

export type DialPadContextValue = {
  readonly value: string
  readonly onDigit: (digit: string) => void
  readonly onDelete: () => void
}

export const DialPadContext = createContext<DialPadContextValue | null>(null)

export function useDialPad(): DialPadContextValue {
  const context = useContext(DialPadContext)
  if (!context) throw new Error('useDialPad must be used within <DialPad>')
  return context
}
