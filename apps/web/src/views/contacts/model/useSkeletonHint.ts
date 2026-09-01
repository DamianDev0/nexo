'use client'

import { useEffect, useState } from 'react'

import { readSkeletonHint, type ContactsSkeletonHint } from '@/entities/contact'

import { DEFAULT_SKELETON_HINT } from '../config/skeleton.constants'

export function useSkeletonHint(): ContactsSkeletonHint {
  const [hint, setHint] = useState<ContactsSkeletonHint>(DEFAULT_SKELETON_HINT)

  useEffect(() => {
    const stored = readSkeletonHint()
    if (stored) setHint(stored)
  }, [])

  return hint
}
