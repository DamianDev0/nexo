import {
  CalendarBlankIcon,
  ChecksIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EnvelopeSimpleIcon,
  HashIcon,
  LinkSimpleIcon,
  ListBulletsIcon,
  PhoneIcon,
  TextAaIcon,
  TextAlignLeftIcon,
  ToggleLeftIcon,
} from '@/shared/ui/icons'

import type { AppIcon } from '@/shared/ui/icons'
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

export const FIELD_TYPE_ICONS: Readonly<Partial<Record<CustomFieldType, AppIcon>>> = {
  text: TextAaIcon,
  textarea: TextAlignLeftIcon,
  number: HashIcon,
  currency: CurrencyDollarIcon,
  date: CalendarBlankIcon,
  datetime: ClockIcon,
  select: ListBulletsIcon,
  multiselect: ChecksIcon,
  boolean: ToggleLeftIcon,
  url: LinkSimpleIcon,
  phone: PhoneIcon,
  email: EnvelopeSimpleIcon,
}

export const CUSTOM_FIELD_ENTITY_TERMS = {
  contacts: 'contact',
  companies: 'company',
  deals: 'deal',
} as const satisfies Record<CustomFieldEntity, string>
