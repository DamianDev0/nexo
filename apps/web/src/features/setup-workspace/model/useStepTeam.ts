import { UserRole } from '@repo/shared-types'
import { t } from 'i18next'
import { useCallback } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { sileo } from 'sileo'

import settingsService from '@/shared/api/services/settings.service'

import { useStepMutation } from './useStepMutation'

interface InviteRow {
  email: string
  role: UserRole
}

interface TeamFormValues {
  invites: InviteRow[]
}

function newInvite(): InviteRow {
  return { email: '', role: UserRole.SALES_REP }
}

export function useStepTeam(onNext: () => void) {
  const { control, watch, getValues } = useForm<TeamFormValues>({
    defaultValues: { invites: [newInvite()] },
  })
  const { fields, append, remove, update } = useFieldArray({ control, name: 'invites' })
  const watchedInvites = watch('invites')

  const invites = fields.map((field, index) => ({
    ...(watchedInvites[index] ?? field),
    id: field.id,
  }))

  const indexOf = useCallback((id: string) => fields.findIndex((f) => f.id === id), [fields])

  const handleAdd = useCallback(() => append(newInvite()), [append])

  const handleRemove = useCallback(
    (id: string) => {
      const index = indexOf(id)
      if (index >= 0) remove(index)
    },
    [indexOf, remove],
  )

  const handleUpdate = useCallback(
    (id: string, patch: Partial<InviteRow>) => {
      const index = indexOf(id)
      if (index < 0) return
      update(index, { ...getValues(`invites.${index}`), ...patch })
    },
    [indexOf, update, getValues],
  )

  const { handleSave, isPending } = useStepMutation({
    mutationFn: async () => {
      const valid = getValues('invites').filter((inv) => inv.email.trim().length > 0)
      await Promise.all(
        valid.map((inv) => settingsService.inviteUser({ email: inv.email, role: inv.role })),
      )
      return valid.length
    },
    onNext,
    errorTitle: t('auth.toasts.invitesFailed'),
    onSuccess: (count) => {
      if (count > 0) sileo.success({ title: t('auth.toasts.invitesSent', { count }) })
    },
  })

  return {
    invites,
    handleAdd,
    handleRemove,
    handleUpdate,
    handleSave,
    isPending,
  }
}
