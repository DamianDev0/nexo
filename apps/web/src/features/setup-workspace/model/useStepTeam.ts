import { t } from 'i18next'
import { useCallback, useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { sileo } from 'sileo'

import { useFormFields } from '@/shared/lib/hooks/useFormFields'

import { inviteUsersAction } from '../api/setup-steps.actions'
import { TEAM_INVITE_DEFAULT } from '../config/team.constants'
import { useStepMutation } from '../query/useStepMutation'

import type { InviteRow, TeamFormValues } from './types'

export function useStepTeam(onNext: () => void) {
  const { control, setValue, getValues } = useForm<TeamFormValues>({
    defaultValues: { invites: [TEAM_INVITE_DEFAULT] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'invites' })
  const { setField } = useFormFields(setValue)

  const indexOf = useCallback(
    (id: string) => fields.findIndex((field) => field.id === id),
    [fields],
  )

  const handleAdd = useCallback(() => append(TEAM_INVITE_DEFAULT), [append])

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
      if (patch.email !== undefined) setField(`invites.${index}.email`, patch.email)
      if (patch.role !== undefined) setField(`invites.${index}.role`, patch.role)
    },
    [indexOf, setField],
  )

  const { handleSave, isPending } = useStepMutation({
    mutationFn: async () => {
      const valid = getValues('invites').filter((invite) => invite.email.trim().length > 0)
      if (valid.length === 0) return 0
      const result = await inviteUsersAction(valid)
      if (!result.ok) throw new Error(result.error)
      return result.data
    },
    onNext,
    errorTitle: t('auth.toasts.invitesFailed'),
    onSuccess: (count) => {
      if (count > 0) sileo.success({ title: t('auth.toasts.invitesSent', { count }) })
    },
  })

  return useMemo(
    () => ({ control, fields, handleAdd, handleRemove, handleUpdate, handleSave, isPending }),
    [control, fields, handleAdd, handleRemove, handleUpdate, handleSave, isPending],
  )
}
