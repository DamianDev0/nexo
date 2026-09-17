'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { ObjectDescriptor } from './types/object-descriptor'

const ObjectDescriptorContext = createContext<ObjectDescriptor | null>(null)

type ObjectDescriptorProviderProps = {
  readonly descriptor: ObjectDescriptor
  readonly children: ReactNode
}

export function ObjectDescriptorProvider({
  descriptor,
  children,
}: Readonly<ObjectDescriptorProviderProps>) {
  return (
    <ObjectDescriptorContext.Provider value={descriptor}>
      {children}
    </ObjectDescriptorContext.Provider>
  )
}

export function useObjectDescriptor(): ObjectDescriptor {
  const descriptor = useContext(ObjectDescriptorContext)
  if (!descriptor)
    throw new Error('useObjectDescriptor must be used inside ObjectDescriptorProvider')
  return descriptor
}
