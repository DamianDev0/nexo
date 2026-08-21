import { getEntityLabel } from '@/entities/nomenclature/server'
import { getT } from '@/shared/i18n/server'
import { ContactsImportView } from '@/views/contacts-import'

import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const entities = await getEntityLabel('contact', 'plural')
  return { title: t('contacts.import.title', { entities }) }
}

export default function ContactsImportPage() {
  return <ContactsImportView />
}
