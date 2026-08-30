import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { getActivityTypes } from '@/shared/api/dal/settings'
import { getT } from '@/shared/i18n/server'
import { QUERY_KEYS } from '@/shared/query/query-keys'
import { getServerQueryClient, prefetch } from '@/shared/query/server-query'
import { SettingsView } from '@/views/settings'

import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('settings.sections.activities') }
}

export default async function Page() {
  const queryClient = getServerQueryClient()
  await prefetch(queryClient, QUERY_KEYS.settings.activityTypes, getActivityTypes)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettingsView pane="activities" />
    </HydrationBoundary>
  )
}
