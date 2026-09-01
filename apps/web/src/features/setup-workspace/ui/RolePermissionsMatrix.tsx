'use client'

import { INVITE_ROLE_OPTIONS, USER_ROLE_LABELS, hasPermission } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { CheckIcon, MinusIcon } from '@/shared/ui/icons'

import { PERMISSION_COLUMNS } from '../config/team.constants'

export function RolePermissionsMatrix() {
  const { t } = useTranslation()
  const s = 'onboarding.steps.team'

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Text variant="emphasis">{t(`${s}.rolesAndPermissions`)}</Text>
        <Text as="p" variant="hint" className="mt-0.5">
          {t(`${s}.permissionsHint`)}
        </Text>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="grid grid-cols-5 gap-0 border-b border-border bg-muted/40 px-4 py-2.5">
          <Text variant="caption">{t(`${s}.colRole`)}</Text>
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
            <Text variant="label">
              {t(`${s}.roles.${role}`, { defaultValue: USER_ROLE_LABELS[role] })}
            </Text>
            {PERMISSION_COLUMNS.map((col) => {
              const allowed = hasPermission(role, col.resource, col.action)
              return (
                <span key={col.labelKey} className="flex justify-center">
                  {allowed ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-positive-surface">
                      <CheckIcon className="size-3 text-positive-text dark:text-positive" />
                    </span>
                  ) : (
                    <MinusIcon className="size-3 text-muted-foreground/40" />
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
