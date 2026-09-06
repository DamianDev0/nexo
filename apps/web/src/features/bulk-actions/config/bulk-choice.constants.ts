import type { BulkChoiceKind } from '../model/types/bulk-actions.types'

export const BULK_CHOICE_PARAM_KEY: Readonly<Record<BulkChoiceKind, string>> = {
  status: 'value',
  lifecycle: 'value',
  assign: 'assignedToId',
}
