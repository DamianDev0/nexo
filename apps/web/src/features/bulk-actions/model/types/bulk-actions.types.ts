import type { BulkActionId } from '../../config/bulk-action-registry.constants'

export type BulkChoiceKind = Extract<BulkActionId, 'status' | 'lifecycle' | 'assign'>

export type BulkDialogContext = {
  readonly tags?: readonly string[] | null
}

export type BulkChoiceOption = {
  readonly value: string
  readonly label: string
  readonly description?: string
  readonly badge?: string
  readonly color?: string | null
  readonly initials?: string
}
