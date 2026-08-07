import 'server-only'

import { CACHE_TAGS } from '../cache-tags'
import { apiFetch } from '../client'

import type { Tag, TagEntityType } from '@repo/shared-types'

export const listTags = (entityType: TagEntityType) =>
  apiFetch<Tag[]>(`/tags?entityType=${entityType}`, { tags: [CACHE_TAGS.tags] })
