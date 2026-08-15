import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { getT } from '@/shared/i18n/server'
import { getServerQueryClient } from '@/shared/query/server-query'
import { ContactsView } from '@/views/contacts'
import { prefetchContacts } from '@/widgets/contacts-board'

import type { Metadata } from 'next'

type PageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>
}>

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('nav.contacts') }
}

export default async function ContactsPage({ searchParams }: PageProps) {
  const queryClient = getServerQueryClient()
  await prefetchContacts(queryClient, await searchParams)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContactsView />
    </HydrationBoundary>
  )
}
