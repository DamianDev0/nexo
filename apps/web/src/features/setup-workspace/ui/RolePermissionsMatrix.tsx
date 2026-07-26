import { useTranslation } from 'react-i18next'

const ROLE_MATRIX = [
  { roleKey: 'admin', perms: { view: true, create: true, edit: true, config: true } },
  { roleKey: 'manager', perms: { view: true, create: true, edit: true, config: false } },
  { roleKey: 'sales_rep', perms: { view: true, create: true, edit: false, config: false } },
  { roleKey: 'viewer', perms: { view: true, create: false, edit: false, config: false } },
] as const

const PERM_COLUMNS = ['view', 'create', 'edit', 'config'] as const

export function RolePermissionsMatrix() {
  const { t } = useTranslation()
  const s = 'onboarding.steps.team'

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-5 gap-0 bg-muted px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{t(`${s}.colRole`)}</span>
        <span>{t(`${s}.colView`)}</span>
        <span>{t(`${s}.colCreate`)}</span>
        <span>{t(`${s}.colEdit`)}</span>
        <span>{t(`${s}.colConfig`)}</span>
      </div>
      {ROLE_MATRIX.map((row) => (
        <div
          key={row.roleKey}
          className="grid grid-cols-5 gap-0 border-t border-border px-3 py-2 text-xs"
        >
          <span className="font-semibold">{t(`roles.${row.roleKey}`)}</span>
          {PERM_COLUMNS.map((perm) => (
            <span key={perm} className={row.perms[perm] ? 'text-emerald-500' : 'text-destructive'}>
              {row.perms[perm] ? '✓' : '✗'}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
