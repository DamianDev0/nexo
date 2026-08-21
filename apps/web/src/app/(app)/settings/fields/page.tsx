import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { getCustomFields } from '@/shared/api/dal/settings'
import { getT } from '@/shared/i18n/server'
import { QUERY_KEYS } from '@/shared/query/query-keys'
import { getServerQueryClient, prefetch } from '@/shared/query/server-query'
import { SettingsView } from '@/views/settings'

import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('settings.sections.fields') }
}

export default async function Page() {
  const queryClient = getServerQueryClient()
  await prefetch(queryClient, QUERY_KEYS.settings.customFields('contacts'), () =>
    getCustomFields('contacts'),
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettingsView pane="fields" />
    </HydrationBoundary>
  )
}
