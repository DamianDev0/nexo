'use client'

import { useEntityTerms } from '@/entities/nomenclature'
import { useObjectDescriptor } from '@/entities/object-descriptor'

export function useImportDescriptor() {
  const descriptor = useObjectDescriptor()
  const terms = useEntityTerms(descriptor.type)
  if (!descriptor.imports) {
    throw new Error(`Records of type ${descriptor.type} cannot be imported`)
  }
  return { config: descriptor.imports, terms, descriptor }
}
