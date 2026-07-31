import 'server-only'

import { type QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

import { createQueryClient } from './query-client'

export const getServerQueryClient = cache((): QueryClient => createQueryClient())

export async function prefetch<T>(
  client: QueryClient,
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
): Promise<void> {
  await client.prefetchQuery({ queryKey, queryFn }).catch(() => undefined)
}
