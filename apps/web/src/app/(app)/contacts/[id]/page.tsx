import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { getContact } from '@/shared/api/dal/contacts'
import { getT } from '@/shared/i18n/server'
import { QUERY_KEYS } from '@/shared/query/query-keys'
import { getServerQueryClient, prefetch } from '@/shared/query/server-query'
import { ContactDetailView } from '@/views/contact-detail'

import type { Metadata } from 'next'

type PageProps = Readonly<{ params: Promise<{ id: string }> }>

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('nav.contacts') }
}

export default async function ContactDetailPage({ params }: PageProps) {
  const { id } = await params
  const queryClient = getServerQueryClient()
  await prefetch(queryClient, QUERY_KEYS.contacts.detail(id), () => getContact(id))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContactDetailView contactId={id} />
    </HydrationBoundary>
  )
}
