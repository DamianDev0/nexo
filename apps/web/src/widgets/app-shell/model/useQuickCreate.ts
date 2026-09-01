'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { useEntityLabels } from '@/entities/nomenclature'

import { buildQuickCreateItems } from '../lib/quick-create-items'

export function useQuickCreate() {
  const router = useRouter()
  const entityLabel = useEntityLabels()
  const [open, setOpen] = useState(false)

  const items = buildQuickCreateItems(entityLabel)

  const onSelect = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  return { open, setOpen, items, onSelect }
}
