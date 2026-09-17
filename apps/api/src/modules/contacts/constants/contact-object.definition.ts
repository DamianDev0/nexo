import type { ContactSortField } from '@repo/shared-types'
import type { ObjectTableDefinition } from '@/shared/object-engine/interfaces/object-definition.interfaces'
import { CONTACT_COLUMN_CATALOG } from './contact-columns.catalog'

export const CONTACT_OBJECT: ObjectTableDefinition<ContactSortField> = {
  type: 'contact',
  columns: CONTACT_COLUMN_CATALOG,
}
