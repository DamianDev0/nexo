'use client'

import { useEffect, useState } from 'react'

import { readSkeletonHint, type RecordsSkeletonHint } from '@/entities/object-descriptor'
import { OBJECT_QUERY_ROOTS } from '@/shared/query/query-keys'

import { DEFAULT_SKELETON_HINT } from '../config/skeleton.constants'

export function useSkeletonHint(): RecordsSkeletonHint {
  const [hint, setHint] = useState<RecordsSkeletonHint>(DEFAULT_SKELETON_HINT)

  useEffect(() => {
    const stored = readSkeletonHint(OBJECT_QUERY_ROOTS.contact)
    if (stored) setHint(stored)
  }, [])

  return hint
}
