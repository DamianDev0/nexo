'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { sileo } from 'sileo'

import companiesService from '@/shared/api/services/companies.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

type LinkInput = {
  readonly companyId: string
  readonly contactId: string
}

export function useLinkContactCompany(contactId: string) {
  const queryClient = useQueryClient()

  const settle = async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.detail(contactId) })
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.lists })
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies.all })
  }

  const link = useMutation({
    mutationFn: ({ companyId, contactId: id }: LinkInput) =>
      companiesService.assignContact(companyId, id),
    onError: () => sileo.error({ title: t('common.saveFailed') }),
    onSuccess: async () => {
      await settle()
      sileo.success({ title: t('contacts.company.linked') })
    },
  })

  const unlink = useMutation({
    mutationFn: ({ companyId, contactId: id }: LinkInput) =>
      companiesService.removeContact(companyId, id),
    onError: () => sileo.error({ title: t('common.saveFailed') }),
    onSuccess: async () => {
      await settle()
      sileo.success({ title: t('contacts.company.unlinked') })
    },
  })

  return {
    link: (companyId: string) => link.mutate({ companyId, contactId }),
    unlink: (companyId: string) => unlink.mutate({ companyId, contactId }),
    isPending: link.isPending || unlink.isPending,
  }
}
