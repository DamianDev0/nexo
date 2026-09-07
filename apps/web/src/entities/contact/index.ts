export {
  contactAvatarTone,
  contactAvatarUrl,
  contactFullName,
  contactInitials,
} from './lib/contact-display'
export { CONTACT_AVATARS } from './config/contact-avatars.constants'
export type { AvatarTone } from './lib/contact-display'
export { buildContactColumns } from './ui/columns/contact-columns'
export type {
  ContactColumnContext,
  ContactComposeChannel,
  ContactFieldsPatch,
  ContactLogKind,
  ContactOwnerChange,
  ContactRowActions,
  ContactTaxonomyMaps,
} from './model/types/contact-cells.types'
export { revalidateContacts } from './api/revalidate-contacts'
export { buildContactPreviewRows, customText } from './lib/contact-preview'
export { useContactTimeline } from './query/useContactTimeline'
export {
  contactCoreFieldsSchema,
  optionalEmailSchema,
  optionalPhoneSchema,
} from './lib/contact-field-schemas'
export { ContactPhoneField } from './ui/fields/ContactPhoneField'
export { ContactAddressField } from './ui/fields/ContactAddressField'
export { ContactCityField, type MunicipalityPick } from './ui/fields/ContactCityField'
export { TaxonomySelectField } from './ui/fields/TaxonomySelectField'
export { useAddressAutofill } from './model/useAddressAutofill'
export { CONTACT_ADDRESS_KEY } from './config/contact-columns.constants'
export {
  missingContactFields,
  missingFieldsHint,
  type ContactRequiredField,
} from './lib/contact-completeness'
export {
  fromColumnSort,
  parseSortParam,
  serializeSort,
  toColumnSort,
  type ContactSort,
} from './lib/contact-sort'
export { useContactList, usePrefetchContactList } from './query/useContactList'
export { useOptimisticContactListPatch } from './query/useOptimisticContactListPatch'
export { contactDialNumber, contactPhoneLabel } from './lib/contact-links'
export { readSkeletonHint, writeSkeletonHint, type ContactsSkeletonHint } from './lib/skeleton-hint'
export { useRestoreContact } from './query/useRestoreContact'
export { listQueryFilters, type ContactListFilters } from './lib/list-query'
