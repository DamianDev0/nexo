import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { sileo } from 'sileo'

import { useEntityTerms } from '@/entities/nomenclature'
import contactsService from '@/shared/api/services/contacts.service'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

export function useArchiveContacts() {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (ids: readonly string[]) => {
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
        sileo.error({
          title: t('contacts.toasts.archivedPartial', {
            archived,
            total,
            entities: terms.lowerPlural,
          }),
        })
        return
      }
      sileo.success({
        title: t('contacts.toasts.archived', {
          count: total,
          entity: terms.singular,
          entities: terms.plural,
        }),
      })
    },
    onError: (error: { message?: string }) => notifySaveFailed(error),
  })

  return { archive: mutation.mutate, isArchiving: mutation.isPending }
}
