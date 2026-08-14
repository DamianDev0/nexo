import type { UserRole } from '@repo/shared-types'
import type { Action, Resource } from '@repo/shared-utils'

export interface PermissionColumn {
  readonly labelKey: 'colView' | 'colCreate' | 'colEdit' | 'colConfig'
  readonly resource: Resource
  readonly action: Action
}

export interface InviteRow {
  email: string
  role: UserRole
}

export interface TeamFormValues {
  invites: InviteRow[]
}
