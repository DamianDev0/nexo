import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { getContactTaxonomyUsage } from '@/shared/api/dal/contacts'
import { getT } from '@/shared/i18n/server'
import { QUERY_KEYS } from '@/shared/query/query-keys'
import { getServerQueryClient, prefetch } from '@/shared/query/server-query'
import { SettingsView } from '@/views/settings'

import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('settings.sections.contacts') }
}

export default async function Page() {
  const queryClient = getServerQueryClient()
  await prefetch(queryClient, QUERY_KEYS.contacts.taxonomyUsage, getContactTaxonomyUsage)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettingsView pane="contactLifecycle" />
    </HydrationBoundary>
  )
}
