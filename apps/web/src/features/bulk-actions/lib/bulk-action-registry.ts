import {
  BULK_ACTION_REGISTRY,
  BULK_BAR_ORDER,
  type BulkActionDef,
  type BulkActionId,
  type BulkListScope,
} from '../config/bulk-action-registry.constants'

import type {
  BulkActionSelection,
  CreateBulkActionInput,
  CustomFieldEntity,
} from '@repo/shared-types'

export function bulkActionsFor(scope: BulkListScope): ReadonlyArray<BulkActionDef> {
  return BULK_BAR_ORDER[scope].map((id) => BULK_ACTION_REGISTRY[id])
}

export function bulkScope(archived: boolean): BulkListScope {
  return archived ? 'archived' : 'active'
}

export function buildActionRequest(
  id: BulkActionId,
  entity: CustomFieldEntity,
  selection: BulkActionSelection,
  params: Record<string, unknown> = {},
): CreateBulkActionInput {
  const def = BULK_ACTION_REGISTRY[id]
  return { entity, action: def.kind, params: { ...def.params, ...params }, selection }
}
