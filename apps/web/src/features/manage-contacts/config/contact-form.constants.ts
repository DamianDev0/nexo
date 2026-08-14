import { DEFAULT_CONTACT_STATUS_KEY } from '@repo/shared-types'

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
  status: DEFAULT_CONTACT_STATUS_KEY,
  source: '',
  type: '',
  typeLabel: '',
}
