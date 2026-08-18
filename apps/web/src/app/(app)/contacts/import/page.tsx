import { getT } from '@/shared/i18n/server'
import { ContactsImportView } from '@/views/contacts-import'

import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('contacts.import.title') }
}

export default function ContactsImportPage() {
  return <ContactsImportView />
}
