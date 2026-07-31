import type { Action, Resource } from '@repo/shared-utils'

export interface PermissionColumn {
  readonly labelKey: 'colView' | 'colCreate' | 'colEdit' | 'colConfig'
  readonly resource: Resource
  readonly action: Action
}
