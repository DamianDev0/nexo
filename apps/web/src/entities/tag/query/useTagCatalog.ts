'use client'

import { MAX_PAGE_SIZE } from '@repo/shared-utils'
import { useQuery } from '@tanstack/react-query'

import tagsService from '@/shared/api/services/tags.service'
import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { Tag, TagEntityType } from '@repo/shared-types'

const CATALOG_STALE_MS = 5 * 60 * 1000
const MAX_CATALOG_PAGES = 10

const EMPTY_CATALOG: ReadonlyMap<string, Tag> = new Map()

function toCatalogMap(tags: Tag[]): ReadonlyMap<string, Tag> {
  return new Map(tags.map((tag) => [tag.name.toLowerCase(), tag]))
}

async function fetchAllTags(entityType: TagEntityType): Promise<Tag[]> {
  const tags: Tag[] = []
  let page = 1

  for (;;) {
    const result = await tagsService.list({ entityType, page, limit: MAX_PAGE_SIZE })
    tags.push(...result.data)
    const hasMore = tags.length < result.total && result.data.length > 0
    if (!hasMore || page >= MAX_CATALOG_PAGES) return tags
    page += 1
  }
}

export function useTagCatalog(entityType: TagEntityType): ReadonlyMap<string, Tag> {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.tags.catalog(entityType),
    queryFn: () => fetchAllTags(entityType),
    staleTime: CATALOG_STALE_MS,
    select: toCatalogMap,
  })

  return data ?? EMPTY_CATALOG
}
