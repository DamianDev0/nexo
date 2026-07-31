import 'server-only'

import { CACHE_TAGS } from '../cache-tags'
import { apiFetch } from '../client'

import type { MeResponse } from '@repo/shared-types'

export const getMe = () =>
  apiFetch<MeResponse>('/auth/me', { cache: 'no-store', tags: [CACHE_TAGS.me] })
