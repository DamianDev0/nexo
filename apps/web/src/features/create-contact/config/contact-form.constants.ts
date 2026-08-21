import type { ContactFormValues } from '../lib/contact-form.schema'

export const CONTACT_FORM_DEFAULTS: ContactFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  whatsapp: '',
  whatsappSameAsPhone: false,
  address: '',
  city: '',
  municipioCode: '',
  avatarUrl: '',
  status: '',
  source: '',
  type: '',
  typeLabel: '',
}
