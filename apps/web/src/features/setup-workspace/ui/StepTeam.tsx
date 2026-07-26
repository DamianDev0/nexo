import { INVITE_ROLE_OPTIONS, USER_ROLE_LABELS } from '@repo/shared-utils'
import { Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select'

import { RolePermissionsMatrix } from './RolePermissionsMatrix'
import { WizardStep, type WizardStepNav } from './WizardStep'

import type { InviteUserRequest, UserRole } from '@repo/shared-types'

type InviteRow = Readonly<InviteUserRequest & { id: string }>

interface TeamActions {
  readonly onAdd: () => void
  readonly onRemove: (id: string) => void
  readonly onUpdate: (id: string, patch: Partial<Omit<InviteRow, 'id'>>) => void
}

interface StepTeamProps {
  readonly data: ReadonlyArray<InviteRow>
  readonly actions: TeamActions
  readonly nav: WizardStepNav
}

export function StepTeam({ data, actions, nav }: Readonly<StepTeamProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.team'

  return (
    <WizardStep
      header={{ badge: t(`${s}.badge`), title: t(`${s}.title`), description: t(`${s}.subtitle`) }}
      nav={{ ...nav, nextLabel: t(`${s}.finishSetup`), footerNote: t(`${s}.canInviteLater`) }}
    >
      <div className="flex flex-col gap-2">
        {data.map((inv) => (
          <div key={inv.id} className="flex items-center gap-2">
            <Input
              className="h-9 flex-1 border-border text-sm"
              type="email"
              placeholder="colleague@company.com"
              value={inv.email}
              onChange={(e) => actions.onUpdate(inv.id, { email: e.target.value })}
            />
            <Select
              value={inv.role}
              onValueChange={(v) => actions.onUpdate(inv.id, { role: v as UserRole })}
            >
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
            {data.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => actions.onRemove(inv.id)}
                className="size-9 shrink-0 text-muted-foreground hover:border-destructive/50 hover:text-destructive"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={actions.onAdd}
        className="mt-2 w-full justify-start gap-2 border-dashed p-2.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
      >
        <Plus className="size-3.5" />
        {t(`${s}.addMember`)}
      </Button>

      <RolePermissionsMatrix />
    </WizardStep>
  )
}
