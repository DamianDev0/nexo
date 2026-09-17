import { OBJECT_QUERY_ROOTS } from '@/shared/query/query-keys'

import type { ObjectDescriptor } from '@/entities/object-descriptor'

export const CONTACT_DESCRIPTOR: ObjectDescriptor = {
  type: 'contact',
  apiPath: '/contacts',
  queryRoot: OBJECT_QUERY_ROOTS.contact,
  defaultPinnedColumns: ['name'],
}
