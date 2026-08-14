import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

export function useArchiveContact() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => contactsService.archive(id)))
      return {
        total: ids.length,
        archived: results.filter((result) => result.status === 'fulfilled').length,
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
    },
    onSuccess: ({ total, archived }) => {
      if (archived === 0) {
        sileo.error({ title: t('common.saveFailed') })
        return
      }
      if (archived < total) {
        sileo.error({ title: t('contacts.toasts.archivedPartial', { archived, total }) })
        return
      }
      sileo.success({
        title: t(total === 1 ? 'contacts.toasts.archived' : 'contacts.toasts.archivedMany'),
      })
    },
    onError: (error: { message?: string }) => {
      sileo.error({ title: t('common.saveFailed'), description: error.message })
    },
  })

  return { archive: mutation.mutate, isArchiving: mutation.isPending }
}
