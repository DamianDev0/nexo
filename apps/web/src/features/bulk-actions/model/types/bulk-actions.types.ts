import type { BulkActionKind } from '@repo/shared-types'

export type BulkDialogKind = 'add_tags' | 'remove_tags' | 'status' | 'archive' | 'restore'

export type BulkBarKind = Extract<
  BulkActionKind,
  'add_tags' | 'remove_tags' | 'update_field' | 'export' | 'archive'
>
