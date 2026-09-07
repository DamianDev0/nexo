'use client'

import { createContext, useContext } from 'react'

import type { ComposerPlacement } from './constants'
import type { ReactNode } from 'react'

const PlacementContext = createContext<ComposerPlacement>('corner')

export function useComposerPlacement(): ComposerPlacement {
  return useContext(PlacementContext)
}

type ComposerPlacementProviderProps = {
  readonly value: ComposerPlacement
  readonly children: ReactNode
}

export function ComposerPlacementProvider({
  value,
  children,
}: Readonly<ComposerPlacementProviderProps>) {
  return <PlacementContext.Provider value={value}>{children}</PlacementContext.Provider>
}
