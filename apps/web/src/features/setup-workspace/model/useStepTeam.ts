import { UserRole } from '@repo/shared-types'
import { t } from 'i18next'
import { sileo } from 'sileo'

import settingsService from '@/shared/api/services/settings.service'
import { useEditableList } from '@/shared/lib/hooks/useEditableList'

import { useStepMutation } from './useStepMutation'

import type { InviteUserRequest } from '@repo/shared-types'

function newInvite(): InviteUserRequest {
  return { email: '', role: UserRole.SALES_REP }
}

export function useStepTeam(onNext: () => void) {
  const {
    items: invites,
    add,
    remove,
    update,
  } = useEditableList<InviteUserRequest>([newInvite()], newInvite)

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
