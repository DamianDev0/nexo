import contactsService from '@/shared/api/services/contacts.service'
import { ROUTES } from '@/shared/config/routes'
import { OBJECT_QUERY_ROOTS } from '@/shared/query/query-keys'
import { UsersThreeIcon } from '@/shared/ui/icons'

import { revalidateContacts } from '../api/revalidate-contacts'
import { contactFullName } from '../lib/contact-display'
import { invalidateContactRecords } from '../query/invalidate-contact-records'

import {
  CONTACT_IMPORT_TEMPLATE_HEADERS,
  CONTACT_IMPORT_TEMPLATE_SAMPLE,
} from './contact-import-template.constants'

import type { ObjectDescriptor } from '@/entities/object-descriptor'
import type { ContactListItem } from '@repo/shared-types'

export const CONTACT_DESCRIPTOR: ObjectDescriptor<ContactListItem> = {
  type: 'contact',
  apiPath: '/contacts',
  queryRoot: OBJECT_QUERY_ROOTS.contact,
  defaultPinnedColumns: ['name'],
  icon: UsersThreeIcon,
  searchPlaceholderKey: 'contacts.searchPlaceholder',
  api: {
    update: (id, patch) => contactsService.update(id, patch),
    archive: (id) => contactsService.archive(id),
    restore: (id) => contactsService.restore(id),
  },
  routes: {
    list: ROUTES.app.contacts.list,
    import: ROUTES.app.contacts.import,
    listSettings: ROUTES.app.settings.contacts.status,
    detail: (id) => ROUTES.app.contacts.detail(id),
  },
  imports: {
    analyze: (file) => contactsService.analyzeImport(file),
    preview: (run) => contactsService.previewImport(run),
    validate: (run) => contactsService.validateImport(run),
    execute: (run) => contactsService.executeImport(run),
    fieldLabelKey: 'contacts.import.fields',
    matchNoteKey: 'contacts.import.matchNote',
    template: {
      headers: CONTACT_IMPORT_TEMPLATE_HEADERS,
      sample: CONTACT_IMPORT_TEMPLATE_SAMPLE,
    },
  },
  displayName: (contact) => contactFullName(contact),
  dealLink: (contactId) => ({ contactId }),
  invalidateRecords: (client, id) => invalidateContactRecords(client, id),
  revalidate: () => revalidateContacts(),
}
