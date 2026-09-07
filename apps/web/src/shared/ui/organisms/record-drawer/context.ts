'use client'

import { createContext, useContext } from 'react'

import type { Accordion } from './model/use-accordion'

export const AccordionContext = createContext<Accordion | null>(null)

export function useAccordionContext(): Accordion {
  const context = useContext(AccordionContext)
  if (!context) throw new Error('RecordDrawer.Section must be used within <RecordDrawer.Sections>')
  return context
}
