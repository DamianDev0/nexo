import 'server-only'

import { redirect } from 'next/navigation'

import { NOTIFICATION_PAGE_SIZE } from '@/shared/config/pagination'
import { ROUTES } from '@/shared/config/routes'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import { getMe } from '../api/dal/auth'
import { listUnreadNotifications } from '../api/dal/notifications'
import {
  getContactTaxonomy,
  getGeneral,
  getNavigation,
  getNomenclature,
  getOnboarding,
  getPipelines,
  getTheme,
} from '../api/dal/settings'

import { getServerQueryClient, prefetch } from './server-query'

import type { QueryClient } from '@tanstack/react-query'

async function prefetchShell(
  options: { requireOnboarded?: boolean } | undefined,
  extras: ReadonlyArray<Promise<void>> | ((client: QueryClient) => ReadonlyArray<Promise<void>>),
): Promise<QueryClient> {
  const client = getServerQueryClient()

  const me = await getMe().catch(() => null)
  if (!me) redirect(ROUTES.auth.login)
  if (options?.requireOnboarded && !me.onboardingCompleted) redirect(ROUTES.setup.onboarding)

  client.setQueryData(QUERY_KEYS.auth.me, me)

  await Promise.all([
    prefetch(client, QUERY_KEYS.settings.general, getGeneral),
    prefetch(client, QUERY_KEYS.settings.theme, getTheme),
    prefetch(client, QUERY_KEYS.settings.navigation, getNavigation),
    prefetch(client, QUERY_KEYS.settings.contactTaxonomy, getContactTaxonomy),
    prefetch(client, QUERY_KEYS.settings.nomenclature, getNomenclature),
    prefetch(client, QUERY_KEYS.notifications.unread(NOTIFICATION_PAGE_SIZE), () =>
      listUnreadNotifications(NOTIFICATION_PAGE_SIZE),
    ),
    ...(typeof extras === 'function' ? extras(client) : extras),
  ])

  return client
}

export async function prefetchAppShell(options?: {
  requireOnboarded?: boolean
}): Promise<QueryClient> {
  return prefetchShell(options, [])
}

export async function prefetchSetupWizard(): Promise<QueryClient> {
  return prefetchShell(undefined, (client) => [
    prefetch(client, QUERY_KEYS.settings.onboarding, getOnboarding),
    prefetch(client, QUERY_KEYS.settings.pipelines, getPipelines),
  ])
}
