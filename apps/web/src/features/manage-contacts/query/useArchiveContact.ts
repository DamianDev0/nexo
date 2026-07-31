import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import contactsService from '@/shared/api/services/contacts.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

export function useArchiveContact() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => contactsService.archive(id))),
    onSuccess: (_, ids) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
      sileo.success({
        title: t(ids.length === 1 ? 'contacts.toasts.archived' : 'contacts.toasts.archivedMany'),
      })
    },
    onError: (error: { message?: string }) => {
      sileo.error({ title: t('common.saveFailed'), description: error.message })
    },
  })

  return { archive: mutation.mutate, isArchiving: mutation.isPending }
}
