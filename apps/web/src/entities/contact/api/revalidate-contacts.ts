'use server'

import { updateTag } from 'next/cache'

import { CACHE_TAGS } from '@/shared/api/cache-tags'

export async function revalidateContacts(): Promise<void> {
  updateTag(CACHE_TAGS.contacts)
}
