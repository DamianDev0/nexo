import { getT } from '@/shared/i18n/server'
import { ContactsView } from '@/views/contacts'

import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('nav.contacts') }
}

export default function ContactsPage() {
  return <ContactsView />
}
