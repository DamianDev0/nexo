import { INVITE_ROLE_OPTIONS, USER_ROLE_LABELS, hasPermission } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import { PERMISSION_COLUMNS } from '../model/team.constants'

export function RolePermissionsMatrix() {
  const { t } = useTranslation()
  const s = 'onboarding.steps.team'

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-5 gap-0 bg-muted px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{t(`${s}.colRole`)}</span>
        {PERMISSION_COLUMNS.map((col) => (
          <span key={col.labelKey}>{t(`${s}.${col.labelKey}`)}</span>
        ))}
      </div>
      {INVITE_ROLE_OPTIONS.map((role) => (
        <div key={role} className="grid grid-cols-5 gap-0 border-t border-border px-3 py-2 text-xs">
          <span className="font-semibold">{USER_ROLE_LABELS[role]}</span>
          {PERMISSION_COLUMNS.map((col) => {
            const allowed = hasPermission(role, col.resource, col.action)
            return (
              <span
                key={col.labelKey}
                className={allowed ? 'text-emerald-500' : 'text-destructive'}
              >
                {allowed ? '✓' : '✗'}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}
