import type { PermissionColumn } from '../model/types'

export const PERMISSION_COLUMNS: ReadonlyArray<PermissionColumn> = [
  { labelKey: 'colView', resource: 'deals', action: 'read' },
  { labelKey: 'colCreate', resource: 'deals', action: 'create' },
  { labelKey: 'colEdit', resource: 'deals', action: 'update' },
  { labelKey: 'colConfig', resource: 'settings', action: 'update' },
]
