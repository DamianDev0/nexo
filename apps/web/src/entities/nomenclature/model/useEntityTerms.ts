'use client'

import { useMemo } from 'react'

import { useEntityLabels, type EntityKey } from '../query/useEntityLabels'

export interface EntityTerms {
  readonly singular: string
  readonly plural: string
  readonly lowerSingular: string
  readonly lowerPlural: string
}

export function useEntityTerms(entity: EntityKey): EntityTerms {
  const entityLabel = useEntityLabels()

  return useMemo(() => {
    const singular = entityLabel(entity, 'singular')
    const plural = entityLabel(entity, 'plural')
    return {
      singular,
      plural,
      lowerSingular: singular.toLocaleLowerCase(),
      lowerPlural: plural.toLocaleLowerCase(),
    }
  }, [entity, entityLabel])
}
