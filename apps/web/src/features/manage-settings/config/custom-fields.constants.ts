import type { CustomFieldEntity, CustomFieldType } from '@repo/shared-types'

export const CREATABLE_FIELD_TYPES: ReadonlyArray<CustomFieldType> = [
  'text',
  'textarea',
  'number',
  'currency',
  'date',
  'select',
  'multiselect',
  'boolean',
  'url',
  'phone',
  'email',
]

export const CUSTOM_FIELD_ENTITIES: ReadonlyArray<CustomFieldEntity> = [
  'contacts',
  'companies',
  'deals',
]
