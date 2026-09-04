'use client'

import { createContext, useContext } from 'react'

import type { ComposerWindow } from './model/use-composer-window'

export type ComposerContextValue = ComposerWindow & { readonly onClose?: () => void }

export const ComposerContext = createContext<ComposerContextValue | null>(null)

export function useComposer(): ComposerContextValue {
  const context = useContext(ComposerContext)
  if (!context) throw new Error('useComposer must be used within <Composer>')
  return context
}
