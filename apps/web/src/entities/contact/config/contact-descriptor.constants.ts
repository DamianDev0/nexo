import contactsService from '@/shared/api/services/contacts.service'
import { OBJECT_QUERY_ROOTS } from '@/shared/query/query-keys'

import { contactFullName } from '../lib/contact-display'
import { invalidateContactRecords } from '../query/invalidate-contact-records'

import type { ObjectDescriptor } from '@/entities/object-descriptor'
import type { ContactListItem } from '@repo/shared-types'

export const CONTACT_DESCRIPTOR: ObjectDescriptor<ContactListItem> = {
  type: 'contact',
  apiPath: '/contacts',
  queryRoot: OBJECT_QUERY_ROOTS.contact,
  defaultPinnedColumns: ['name'],
  api: {
    update: (id, patch) => contactsService.update(id, patch),
    archive: (id) => contactsService.archive(id),
    restore: (id) => contactsService.restore(id),
  },
  displayName: (contact) => contactFullName(contact),
  dealLink: (contactId) => ({ contactId }),
  invalidateRecords: (client, id) => invalidateContactRecords(client, id),
}
