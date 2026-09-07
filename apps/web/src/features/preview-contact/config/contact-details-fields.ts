export const CONTACT_DETAILS_FIELDS = [
  {
    name: 'firstName',
    labelKey: 'contacts.form.firstName',
    placeholderKey: 'contacts.form.firstNamePlaceholder',
    autoComplete: 'given-name',
    type: 'text',
  },
  {
    name: 'lastName',
    labelKey: 'contacts.form.lastName',
    placeholderKey: 'contacts.form.lastNamePlaceholder',
    autoComplete: 'family-name',
    type: 'text',
  },
  {
    name: 'email',
    labelKey: 'contacts.form.email',
    placeholderKey: 'contacts.form.emailPlaceholder',
    autoComplete: 'email',
    type: 'email',
  },
  {
    name: 'documentNumber',
    labelKey: 'contacts.columns.documentNumber',
    placeholderKey: 'contacts.preview.details.documentPlaceholder',
    autoComplete: 'off',
    type: 'text',
  },
] as const

export type ContactDetailsInputField = (typeof CONTACT_DETAILS_FIELDS)[number]['name']
