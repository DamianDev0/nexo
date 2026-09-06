'use client'

import { RENDERABLE_FIELD_TYPES } from '@repo/shared-types'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import settingsService from '@/shared/api/services/settings.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { ADDRESS_FIELD_KEY } from '../lib/contact-form-mapping'

import type { FieldDef } from '@repo/shared-types'

const STALE_MS = 5 * 60 * 1000

export function useContactCustomFields(): ReadonlyArray<FieldDef> {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.settings.customFields('contacts'),
    queryFn: () => settingsService.getCustomFields('contacts'),
    staleTime: STALE_MS,
  })

  return useMemo(
    () =>
      (data ?? [])
        .filter(
          (field) =>
            field.key !== ADDRESS_FIELD_KEY &&
            field.isActive !== false &&
            field.showInForm !== false &&
            RENDERABLE_FIELD_TYPES.includes(field.type),
        )
        .sort((a, b) => a.order - b.order),
    [data],
  )
}
