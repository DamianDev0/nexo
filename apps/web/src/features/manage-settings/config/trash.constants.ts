import type { CustomFieldEntity } from '@repo/shared-types'

export const TRASH_TABS = ['contacts', 'tags', 'fields'] as const

export type TrashTab = (typeof TRASH_TABS)[number]

export const TRASH_FIELD_ENTITIES: ReadonlyArray<CustomFieldEntity> = [
  'contacts',
  'companies',
  'deals',
]
