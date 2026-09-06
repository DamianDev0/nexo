'use client'

import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import settingsService from '@/shared/api/services/settings.service'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { TRASH_FIELD_ENTITIES } from '../config/trash.constants'

import type { CustomFieldEntity, FieldDef } from '@repo/shared-types'

export type ArchivedField = {
  readonly entity: CustomFieldEntity
  readonly field: FieldDef
}

export function useArchivedFields() {
  const { t } = useTranslation()
  const client = useQueryClient()

  const results = useQueries({
    queries: TRASH_FIELD_ENTITIES.map((entity) => ({
      queryKey: QUERY_KEYS.settings.customFields(entity),
      queryFn: () => settingsService.getCustomFields(entity),
    })),
  })

  const fields = useMemo<ArchivedField[]>(
    () =>
      TRASH_FIELD_ENTITIES.flatMap((entity, index) =>
        (results[index]?.data ?? [])
          .filter((field) => field.isActive === false)
          .map((field) => ({ entity, field })),
      ),
    [results],
  )

  const restore = useMutation({
    mutationFn: ({ entity, field }: ArchivedField) =>
      settingsService.patchCustomField(entity, field.key, { isActive: true }),
    onSuccess: (_field, { entity }) => {
      sileo.success({ title: t('settings.trash.fieldRestored') })
      void client.invalidateQueries({ queryKey: QUERY_KEYS.settings.customFields(entity) })
    },
    onError: (error: { message?: string }) => notifySaveFailed(error),
  })

  return {
    fields,
    isPending: results.some((result) => result.isPending),
    restore: restore.mutate,
    isRestoring: restore.isPending,
  }
}
