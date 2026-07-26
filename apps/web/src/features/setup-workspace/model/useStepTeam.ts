import { t } from 'i18next'
import { sileo } from 'sileo'

import settingsService from '@/shared/api/services/settings.service'
import { useEditableList } from '@/shared/lib/hooks/useEditableList'

import { useStepMutation } from './useStepMutation'

interface InviteRow {
  email: string
  role: string
}

function newInvite(): InviteRow {
  return { email: '', role: 'sales_rep' }
}

export function useStepTeam(onNext: () => void) {
  const {
    items: invites,
    add,
    remove,
    update,
  } = useEditableList<InviteRow>([newInvite()], newInvite)

  const { handleSave, isPending } = useStepMutation({
    mutationFn: async () => {
      const valid = invites.filter((inv) => inv.email.trim().length > 0)
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
    handleAdd: add,
    handleRemove: remove,
    handleUpdate: update,
    handleSave,
    isPending,
  }
}
