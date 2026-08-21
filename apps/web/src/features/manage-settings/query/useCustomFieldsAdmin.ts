'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import settingsService from '@/shared/api/services/settings.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { CustomFieldEntity, FieldDef } from '@repo/shared-types'

export function useCustomFieldsAdmin(entity: CustomFieldEntity) {
  const queryClient = useQueryClient()

  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.settings.customFields(entity),
    queryFn: () => settingsService.getCustomFields(entity),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings.customFields(entity) })
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
  }

  const onError = (error: { message?: string }) => {
    sileo.error({ title: t('common.saveFailed'), description: error.message })
  }

  const create = useMutation({
    mutationFn: (field: FieldDef) => settingsService.createCustomField(entity, field),
    onSuccess: () => {
      invalidate()
      sileo.success({ title: t('settings.fields.created') })
    },
    onError,
  })

  const archive = useMutation({
    mutationFn: (key: string) => settingsService.archiveCustomField(entity, key),
    onSuccess: () => {
      invalidate()
      sileo.success({ title: t('settings.fields.archived') })
    },
    onError,
  })

  return {
    fields: data ?? [],
    isPending,
    create: create.mutate,
    archive: archive.mutate,
  }
}
