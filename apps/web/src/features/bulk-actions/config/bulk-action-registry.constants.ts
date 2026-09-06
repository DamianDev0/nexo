import {
  ArrowCounterClockwiseIcon,
  ChartLineUpIcon,
  CircleIcon,
  FileArrowDownIcon,
  TagPlusIcon,
  TagXIcon,
  TrashIcon,
  UserCircleIcon,
} from '@/shared/ui/icons'

import type { AppIcon } from '@/shared/ui/icons'
import type { BulkActionKind } from '@repo/shared-types'

export const BULK_ACTION_IDS = [
  'add_tags',
  'remove_tags',
  'status',
  'lifecycle',
  'assign',
  'export',
  'archive',
  'restore',
] as const

export type BulkActionId = (typeof BULK_ACTION_IDS)[number]

export type BulkListScope = 'active' | 'archived'

export type BulkActionDef = {
  readonly id: BulkActionId
  readonly kind: BulkActionKind
  readonly labelKey: string
  readonly icon: AppIcon
  readonly scopes: ReadonlyArray<BulkListScope>
  readonly params?: Readonly<Record<string, unknown>>
  readonly danger?: boolean
}

export const BULK_ACTION_REGISTRY: Readonly<Record<BulkActionId, BulkActionDef>> = {
  add_tags: {
    id: 'add_tags',
    kind: 'add_tags',
    labelKey: 'contacts.bulk.addTags',
    icon: TagPlusIcon,
    scopes: ['active'],
  },
  remove_tags: {
    id: 'remove_tags',
    kind: 'remove_tags',
    labelKey: 'contacts.bulk.removeTags',
    icon: TagXIcon,
    scopes: ['active'],
  },
  status: {
    id: 'status',
    kind: 'update_field',
    labelKey: 'contacts.bulk.changeStatus',
    icon: CircleIcon,
    scopes: ['active'],
    params: { field: 'status' },
  },
  lifecycle: {
    id: 'lifecycle',
    kind: 'update_field',
    labelKey: 'contacts.bulk.changeLifecycle',
    icon: ChartLineUpIcon,
    scopes: ['active'],
    params: { field: 'lifecycleStage' },
  },
  assign: {
    id: 'assign',
    kind: 'assign',
    labelKey: 'contacts.bulk.assign',
    icon: UserCircleIcon,
    scopes: ['active'],
  },
  export: {
    id: 'export',
    kind: 'export',
    labelKey: 'contacts.bulk.export',
    icon: FileArrowDownIcon,
    scopes: ['active', 'archived'],
  },
  archive: {
    id: 'archive',
    kind: 'archive',
    labelKey: 'contacts.bulk.archive',
    icon: TrashIcon,
    scopes: ['active'],
    danger: true,
  },
  restore: {
    id: 'restore',
    kind: 'restore',
    labelKey: 'contacts.bulk.restore',
    icon: ArrowCounterClockwiseIcon,
    scopes: ['archived'],
  },
}

export const BULK_BAR_ORDER: Readonly<Record<BulkListScope, ReadonlyArray<BulkActionId>>> = {
  active: ['add_tags', 'remove_tags', 'status', 'lifecycle', 'assign', 'export', 'archive'],
  archived: ['restore', 'export'],
}
