import { UserRole } from '@repo/shared-types'

import type { InviteRow, PermissionColumn } from '../model/types'

export const PERMISSION_COLUMNS: ReadonlyArray<PermissionColumn> = [
  { labelKey: 'colView', resource: 'deals', action: 'read' },
  { labelKey: 'colCreate', resource: 'deals', action: 'create' },
  { labelKey: 'colEdit', resource: 'deals', action: 'update' },
  { labelKey: 'colConfig', resource: 'settings', action: 'update' },
]

export const TEAM_INVITE_DEFAULT: InviteRow = { email: '', role: UserRole.SALES_REP }
