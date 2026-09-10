'use client'

import { createContext, useContext } from 'react'

import type { RecordLayoutState } from './model/use-record-layout'

export const RecordLayoutContext = createContext<RecordLayoutState | null>(null)

export function useRecordLayoutContext(): RecordLayoutState {
  const context = useContext(RecordLayoutContext)
  if (!context) throw new Error('RecordLayout parts must be used within <RecordLayout>')
  return context
}
