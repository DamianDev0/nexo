'use client'

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { sileo } from 'sileo'

import { Input } from '@/components/atoms/input'
import settingsService from '@/core/services/settings.service'
import { WizardStep } from './WizardStep'

interface InviteRow {
  email: string
  role: string
}

const ROLES = ['admin', 'manager', 'sales_rep', 'viewer'] as const

interface StepTeamProps {
  readonly onNext: () => void
  readonly onBack: () => void
}

export function StepTeam({ onNext, onBack }: StepTeamProps) {
  const [invites, setInvites] = useState<InviteRow[]>([{ email: '', role: 'sales_rep' }])

  const { mutate: sendInvites, isPending } = useMutation({
    mutationFn: async () => {
      const validInvites = invites.filter((inv) => inv.email.trim().length > 0)
      await Promise.all(
        validInvites.map((inv) => settingsService.inviteUser({ email: inv.email, role: inv.role })),
      )
    },
    onSuccess: () => {
      const count = invites.filter((inv) => inv.email.trim().length > 0).length
      if (count > 0) {
        sileo.success({ title: `${count} invitation(s) sent` })
      }
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

  return (
    <WizardStep
      badge="Step 5 of 6"
      title="Invite your team to Nexo"
      description="Add colleagues by email. They'll receive a link to join with the role you assign."
      onBack={onBack}
      onNext={handleSave}
      nextLabel="Finish setup"
      isPending={isPending}
      footerNote="You can invite more people later"
    >
      {/* Invite rows */}
      <div className="flex flex-col gap-2">
        {invites.map((inv, i) => (
          <div key={`invite-${i}`} className="flex items-center gap-2">
            <Input
              className="h-9 flex-1 border-border text-sm"
              type="email"
              placeholder="colleague@company.com"
              value={inv.email}
              onChange={(e) => handleUpdate(i, 'email', e.target.value)}
            />
            <select
              className="h-9 rounded-md border border-border bg-background px-2 text-xs font-semibold capitalize"
              value={inv.role}
              onChange={(e) => handleUpdate(i, 'role', e.target.value)}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role.replace('_', ' ')}
                </option>
              ))}
            </select>
            {invites.length > 1 && (
              <button
                onClick={() => handleRemove(i)}
                className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleAdd}
        className="mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-border p-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="size-3.5" />
        Add another member
      </button>

      {/* Roles reference */}
      <div className="mt-6 rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-5 gap-0 bg-muted px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Role</span>
          <span>View</span>
          <span>Create</span>
          <span>Edit</span>
          <span>Config</span>
        </div>
        {[
          { role: 'Admin', perms: [true, true, true, true] },
          { role: 'Manager', perms: [true, true, true, false] },
          { role: 'Sales Rep', perms: [true, true, false, false] },
          { role: 'Viewer', perms: [true, false, false, false] },
        ].map((row) => (
          <div
            key={row.role}
            className="grid grid-cols-5 gap-0 border-t border-border px-3 py-2 text-xs"
          >
            <span className="font-semibold">{row.role}</span>
            {row.perms.map((allowed, i) => (
              <span
                key={`${row.role}-${i}`}
                className={allowed ? 'text-emerald-500' : 'text-destructive'}
              >
                {allowed ? '✓' : '✗'}
              </span>
            ))}
          </div>
        ))}
      </div>
    </WizardStep>
  )
}
