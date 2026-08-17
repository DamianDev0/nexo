import 'server-only'

import { MAX_PAGE_SIZE } from '@repo/shared-utils'

import { COMPACT_PAGE_SIZE, FIRST_PAGE } from '@/shared/config/pagination'

import { CACHE_TAGS } from '../cache-tags'
import { apiFetch } from '../client'

import type { PaginatedTags, Tag, TagEntityType } from '@repo/shared-types'

export const listTags = (entityType: TagEntityType, page = FIRST_PAGE) =>
  apiFetch<PaginatedTags>(
    `/tags?entityType=${entityType}&page=${page}&limit=${COMPACT_PAGE_SIZE}`,
    {
      tags: [CACHE_TAGS.tags],
    },
  )

export async function listTagCatalog(entityType: TagEntityType): Promise<Tag[]> {
  const tags: Tag[] = []
  let page = FIRST_PAGE

  for (;;) {
    const result = await apiFetch<PaginatedTags>(
      `/tags?entityType=${entityType}&page=${page}&limit=${MAX_PAGE_SIZE}`,
      { tags: [CACHE_TAGS.tags] },
    )
    tags.push(...result.data)
    if (tags.length >= result.total || result.data.length === 0) return tags
    page += 1
  }
}
