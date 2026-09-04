'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sileo } from 'sileo'

import { notifySaveFailed } from '@/shared/lib/notify-save-failed'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { ApiHandledError } from '@/shared/api/error-handler'
import type { Contact, ContactDuplicatePayload } from '@repo/shared-types'

export type SaveContactVariables<TValues> = {
  values: TValues
  addAnother: boolean
  force?: boolean
}

type SaveContactOptions<TValues> = {
  readonly mutationFn: (variables: SaveContactVariables<TValues>) => Promise<Contact>
  readonly successTitle: () => string
  readonly onDuplicate: (duplicate: ContactDuplicatePayload) => void
  readonly onSaved: (addAnother: boolean) => void
  readonly onSubmitStart: () => void
}

export function useSaveContact<TValues>(options: SaveContactOptions<TValues>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<Contact, ApiHandledError, SaveContactVariables<TValues>>({
    mutationFn: options.mutationFn,
    onMutate: options.onSubmitStart,
    onSuccess: (_, { addAnother }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all })
      sileo.success({ title: options.successTitle() })
      options.onSaved(addAnother)
    },
    onError: (error) => {
      if (error.statusCode === 409 && error.message === 'contact_duplicate' && error.duplicate) {
        options.onDuplicate(error.duplicate)
        return
      }
      notifySaveFailed(error)
    },
  })

  return {
    save: mutation.mutate,
    retryWithForce: () => {
      if (mutation.variables) mutation.mutate({ ...mutation.variables, force: true })
    },
    isPending: mutation.isPending,
  }
}
