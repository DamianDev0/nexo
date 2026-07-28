'use client'

import { INVITE_ROLE_OPTIONS, USER_ROLE_LABELS, hasPermission } from '@repo/shared-utils'
import { Check, Minus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PERMISSION_COLUMNS } from '../model/team.constants'

export function RolePermissionsMatrix() {
  const { t } = useTranslation()
  const s = 'onboarding.steps.team'

  return (
    <div className="flex flex-col gap-3">
      <div>
        <span className="text-xs font-semibold text-foreground">
          {t(`${s}.rolesAndPermissions`)}
        </span>
        <p className="mt-0.5 text-xs text-muted-foreground">{t(`${s}.permissionsHint`)}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="grid grid-cols-5 gap-0 border-b border-border bg-muted/40 px-4 py-2.5">
          <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">
            {t(`${s}.colRole`)}
          </span>
          {PERMISSION_COLUMNS.map((col) => (
            <span
              key={col.labelKey}
              className="text-center text-[11px] font-semibold tracking-wide text-muted-foreground"
            >
              {t(`${s}.${col.labelKey}`)}
            </span>
          ))}
        </div>
        {INVITE_ROLE_OPTIONS.map((role) => (
          <div
            key={role}
            className="grid grid-cols-5 items-center gap-0 border-t border-border/60 px-4 py-2.5 first:border-t-0"
          >
            <span className="text-xs font-medium text-foreground">
              {t(`${s}.roles.${role}`, { defaultValue: USER_ROLE_LABELS[role] })}
            </span>
            {PERMISSION_COLUMNS.map((col) => {
              const allowed = hasPermission(role, col.resource, col.action)
              return (
                <span key={col.labelKey} className="flex justify-center">
                  {allowed ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-positive-surface">
                      <Check className="size-3 text-positive-text dark:text-positive" />
                    </span>
                  ) : (
                    <Minus className="size-3 text-muted-foreground/40" />
                  )}
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
