'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import companiesService from '@/shared/api/services/companies.service'
import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

export function useLinkContactCompany(contactId: string) {
  const queryClient = useQueryClient()

  const settle = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.detail(contactId) }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.lists }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies.all }),
    ])

  const link = useMutation({
    mutationFn: (companyId: string) => companiesService.assignContact(companyId, contactId),
    onSuccess: async () => {
      await settle()
      sileo.success({ title: t('contacts.company.linked') })
    },
    onError: notifySaveFailed,
  })

  const unlink = useMutation({
    mutationFn: (companyId: string) => companiesService.removeContact(companyId, contactId),
    onSuccess: async () => {
      await settle()
      sileo.success({ title: t('contacts.company.unlinked') })
    },
    onError: notifySaveFailed,
  })

  return {
    link: link.mutate,
    unlink: unlink.mutate,
    isPending: link.isPending || unlink.isPending,
  }
}
