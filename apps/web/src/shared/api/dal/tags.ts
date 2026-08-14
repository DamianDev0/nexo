import 'server-only'

import { COMPACT_PAGE_SIZE, FIRST_PAGE } from '@/shared/config/pagination'

import { CACHE_TAGS } from '../cache-tags'
import { apiFetch } from '../client'

import type { PaginatedTags, TagEntityType } from '@repo/shared-types'

export const listTags = (entityType: TagEntityType, page = FIRST_PAGE) =>
  apiFetch<PaginatedTags>(
    `/tags?entityType=${entityType}&page=${page}&limit=${COMPACT_PAGE_SIZE}`,
    {
      tags: [CACHE_TAGS.tags],
    },
  )
