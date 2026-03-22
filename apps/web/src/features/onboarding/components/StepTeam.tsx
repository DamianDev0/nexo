import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import { INVITE_ROLE_OPTIONS, USER_ROLE_LABELS } from '@repo/shared-utils'

import { Input } from '@/components/atoms/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/molecules/select'
import { WizardStep } from './WizardStep'

interface InviteRow {
  readonly email: string
  readonly role: string
}

interface StepTeamProps {
  readonly invites: ReadonlyArray<InviteRow>
  readonly isPending: boolean
  readonly onAdd: () => void
  readonly onRemove: (index: number) => void
  readonly onUpdate: (index: number, field: 'email' | 'role', value: string) => void
  readonly onNext: () => void
  readonly onBack: () => void
}

export function StepTeam({
  invites,
  isPending,
  onAdd,
  onRemove,
  onUpdate,
  onNext,
  onBack,
}: StepTeamProps) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.team'

  return (
    <WizardStep
      badge={t(`${s}.badge`)}
      title={t(`${s}.title`)}
      description={t(`${s}.subtitle`)}
      onBack={onBack}
      onNext={onNext}
      nextLabel={t(`${s}.finishSetup`)}
      isPending={isPending}
      footerNote={t(`${s}.canInviteLater`)}
    >
      <div className="flex flex-col gap-2">
        {invites.map((inv, i) => (
          <div key={`invite-${i}`} className="flex items-center gap-2">
            <Input
              className="h-9 flex-1 border-border text-sm"
              type="email"
              placeholder="colleague@company.com"
              value={inv.email}
              onChange={(e) => onUpdate(i, 'email', e.target.value)}
            />
            <Select value={inv.role} onValueChange={(v) => onUpdate(i, 'role', v)}>
              <SelectTrigger className="h-9 w-36 text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVITE_ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role}>
                    {USER_ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {invites.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-border p-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="size-3.5" />
        {t(`${s}.addMember`)}
      </button>

      {/* Roles table */}
      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-5 gap-0 bg-muted px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Rol</span>
          <span>Ver</span>
          <span>Crear</span>
          <span>Editar</span>
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
            {row.perms.map((allowed, idx) => (
              <span
                key={`${row.role}-${idx}`}
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
