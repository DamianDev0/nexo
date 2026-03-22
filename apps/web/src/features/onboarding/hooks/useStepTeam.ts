import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sileo } from 'sileo'
import settingsService from '@/core/services/settings.service'

interface InviteRow {
  email: string
  role: string
}

export function useStepTeam(onNext: () => void) {
  const [invites, setInvites] = useState<InviteRow[]>([{ email: '', role: 'sales_rep' }])

  const { mutate: sendInvites, isPending } = useMutation({
    mutationFn: async () => {
      const valid = invites.filter((inv) => inv.email.trim().length > 0)
      await Promise.all(
        valid.map((inv) => settingsService.inviteUser({ email: inv.email, role: inv.role })),
      )
      return valid.length
    },
    onSuccess: (count) => {
      if (count > 0) sileo.success({ title: `${count} invitation(s) sent` })
      onNext()
    },
    onError: (err) => sileo.error({ title: 'Failed to send invites', description: err.message }),
  })

  const handleAdd = useCallback(() => {
    setInvites((prev) => [...prev, { email: '', role: 'sales_rep' }])
  }, [])

  const handleRemove = useCallback((index: number) => {
    setInvites((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleUpdate = useCallback((index: number, field: keyof InviteRow, value: string) => {
    setInvites((prev) => prev.map((inv, i) => (i === index ? { ...inv, [field]: value } : inv)))
  }, [])

  const handleSave = useCallback(() => sendInvites(), [sendInvites])

  return { invites, handleAdd, handleRemove, handleUpdate, handleSave, isPending }
}
