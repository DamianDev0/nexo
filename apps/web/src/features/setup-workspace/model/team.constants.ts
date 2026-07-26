import type { Action, Resource } from '@repo/shared-utils'

type PermissionColumn = {
  readonly labelKey: 'colView' | 'colCreate' | 'colEdit' | 'colConfig'
  readonly resource: Resource
  readonly action: Action
}

export const PERMISSION_COLUMNS: ReadonlyArray<PermissionColumn> = [
  { labelKey: 'colView', resource: 'deals', action: 'read' },
  { labelKey: 'colCreate', resource: 'deals', action: 'create' },
  { labelKey: 'colEdit', resource: 'deals', action: 'update' },
  { labelKey: 'colConfig', resource: 'settings', action: 'update' },
]
