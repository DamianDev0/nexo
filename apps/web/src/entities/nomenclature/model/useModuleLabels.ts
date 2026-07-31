'use client'

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useEntityLabels } from '../query/useEntityLabels'

import { MODULE_ENTITY } from './module-entity'

export function useModuleLabels() {
  const { t } = useTranslation()
  const entityLabel = useEntityLabels()

  return useCallback(
    (moduleKey: string, titleKey: string): string => {
      const entity = MODULE_ENTITY[moduleKey]
      return entity ? entityLabel(entity, 'plural') : t(titleKey)
    },
    [entityLabel, t],
  )
}
