import {
  ArrowCounterClockwiseIcon,
  CircleIcon,
  FileArrowDownIcon,
  TagPlusIcon,
  TagXIcon,
  TrashIcon,
} from '@/shared/ui/icons'

import type { BulkDialogKind } from '../model/types/bulk-actions.types'
import type { AppIcon } from '@/shared/ui/icons'
export type BulkBarButton = {
  readonly id: BulkDialogKind | 'export'
  readonly labelKey: string
  readonly icon: AppIcon
  readonly danger?: boolean
}

export const BULK_BAR_BUTTONS: ReadonlyArray<BulkBarButton> = [
  { id: 'add_tags', labelKey: 'contacts.bulk.addTags', icon: TagPlusIcon },
  { id: 'remove_tags', labelKey: 'contacts.bulk.removeTags', icon: TagXIcon },
  { id: 'status', labelKey: 'contacts.bulk.changeStatus', icon: CircleIcon },
  { id: 'export', labelKey: 'contacts.bulk.export', icon: FileArrowDownIcon },
  { id: 'archive', labelKey: 'contacts.bulk.archive', icon: TrashIcon, danger: true },
]

export const BULK_ARCHIVED_BAR_BUTTONS: ReadonlyArray<BulkBarButton> = [
  { id: 'restore', labelKey: 'contacts.bulk.restore', icon: ArrowCounterClockwiseIcon },
  { id: 'export', labelKey: 'contacts.bulk.export', icon: FileArrowDownIcon },
]

export const BULK_STATUS_FIELD = 'status'
